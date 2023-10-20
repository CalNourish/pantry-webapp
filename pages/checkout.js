import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import useSWR from 'swr';
import React from 'react';
import Modal from 'react-modal'
import SearchModal from '../components/SearchModal'
import { useUser } from '../context/userContext'
import ReactMarkdown from 'react-markdown';
import { markdownStyle } from '../utils/markdownStyle';

const MAX_ITEM_QUANTITY = 100000;

function fetcher(...urls) {
  const f = (u) =>
    fetch(u, {
      headers: { "Content-Type": "application/json"},
    }).then((r) => r.json());

  if (urls.length > 1) {
    return Promise.all(urls.map(f));
  }
  return f(urls);
}

class Cart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: new Map([]),   /* entries are {barcode: [itemStruct, quantity]} */
      itemsInCart: 0,
      error: null,
      success: null,
      showSearch: false,
      checkoutInfo: props.checkoutInfo,
      isEditing: false,
      showPreview: false,
      loading: false
    }

    let defaultCart = []
    for (let item in props.inventory) {
      if (props.inventory[item]["defaultCart"]) {
        defaultCart.push(props.inventory[item]["barcode"])
      }
    }
    this.defaultCart = defaultCart
    this.getDefaultCart()
  }

  makeReq = () => {
    let reqbody = {};
    this.state.items.forEach((value, key) => {
        reqbody[key] = value[1];
    })
    return JSON.stringify(reqbody);
  }

  showError = (errorText, t) => {
    /* show error banner with error text for 5 seconds, or custom time */
    this.setState({
      error: errorText,
      success: null
    });

    t = t ? t : 5000;
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => this.setState({error: null}), t);
  }

  showSuccess = (msg, t) => {
    /* show error banner with error text for 5 seconds, or custom time */
    this.setState({
      error: null,
      success: msg
    });

    t = t ? t : 5000;
    clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => this.setState({success: null}), t);
  }

  addItem = (newItem, _quantity, defaultCart = false) => {
    let items = this.state.items;
    let barcode = newItem.barcode;

    /* default quantity is 1 if no quantity, or quantity is not a number */
    let quantity = parseInt(_quantity)
    if (isNaN(quantity)) {
      quantity = 1
    }
    else if (quantity > MAX_ITEM_QUANTITY) {
      this.showError(`Quantity '${quantity}' is too high. Using default quantity 1.`, 20000);
      quantity = 1;
    }

    if (items.has(barcode)) { /* if item already in table, just increment count */
      var itemData = items.get(barcode)
      if (itemData[1] + quantity > MAX_ITEM_QUANTITY) {
        this.showError(`New quantity '${itemData[1] + quantity}' is too high.`, 20000);
        return;
      }
      itemData[1] += quantity
      items.set(barcode, itemData)
    } else { /* otherwise, create new row in table */
      items.set(newItem.barcode, [newItem, quantity])
    }

    if (!defaultCart) {
      // focus back on the barcode field
      document.getElementById("barcode").focus();
      this.setState({items: items});
      this.updateTotalCount();
    }
  }

  updateTotalCount = () => {
    let newCount = 0;
    this.state.items.forEach((val, _) => { newCount += val[1] })
    this.setState({itemsInCart: newCount})
  }

  getDefaultCart = () => {
    for (let defaultItemBarcode of this.defaultCart) {
      this.addItem(this.props.inventory[defaultItemBarcode], 0 ,true)
    }
  }

  upItemQuantity = (barcode, refocusBarcode=false) => {
    let items = this.state.items;
    let itemData = items.get(barcode);
    if (!itemData) {
      this.showError("Data corruption: please retry or refresh page", 20000)
      return
    } else if (itemData[1] + 1 > MAX_ITEM_QUANTITY) {
      this.showError(`Quantity '${itemData[1]+1}' is too high.`, 20000);
      return;
    }
    itemData[1] += 1;
    items.set(barcode, itemData);
    this.setState({items: items})
    this.updateTotalCount();
  
    // focus back on the barcode field
    if (refocusBarcode) document.getElementById("barcode").focus();
  }

  downItemQuantity = (barcode, refocusBarcode=false) => {
    let items = this.state.items;
    let itemData = items.get(barcode);
    if (!itemData) {
      this.showError("Data corruption: please retry or refresh page", 20000)
      return
    }

    /* Can't decrease item quantity to negative */
    if (itemData[1] <= 0) {
      return;
    }

    itemData[1] -= 1;
    items.set(barcode, itemData);
    this.setState({items: items})
    this.updateTotalCount();
  
    // focus back on the barcode field
    if (refocusBarcode) document.getElementById("barcode").focus();
  }

  updateItemQuantity = (barcode, newQuantity) => {
    let items = this.state.items;
    let itemData = items.get(barcode);
    if (!itemData) {
      this.showError("Data corruption: please retry or refresh page", 20000)
      return
    }

    if (newQuantity === "") {
      itemData[1] = 0;
      items.set(barcode, itemData);
      this.setState({items: items})
      this.updateTotalCount();
      return;
    }

    newQuantity = parseInt(newQuantity)
    if (isNaN(newQuantity)) {
      this.showError(`Quantity '${newQuantity}' is not a number.`, 20000);
    }
    else if (newQuantity > MAX_ITEM_QUANTITY) {
      this.showError(`Quantity '${newQuantity}' is too high.`, 20000);
    }
    else {
      itemData[1] = newQuantity;
      items.set(barcode, itemData);
      this.setState({items: items});
      this.updateTotalCount();
    }
  }

  deleteItem = (barcode) => {
    let items = this.state.items;
    let itemData = items.get(barcode);
    if (!itemData) {
      this.showError("Data corruption: please retry or refresh page", 20000)
        return
    }
    items.delete(barcode);
    this.setState({items: items})
    this.updateTotalCount();
  
    // focus back on the barcode field
    document.getElementById("barcode").focus();
  }

  itemFormSubmit = (e) => {
    e.preventDefault();
    let barcode = e.target.barcode.value.trim()
    let item = this.props.inventory[barcode]
    if (item && item.barcode) {
      this.setState({error: null, success: null})
      this.addItem(item, e.target.quantity.value)
      
      e.target.barcode.value = null;
      e.target.quantity.value = null;
    } else {
      if (!barcode) {
        this.showError("Please enter a barcode in the field to the left.")
      } else {
        e.target.barcode.value = null;
        e.target.quantity.value = null;
        this.showError(`Not a valid barcode (${barcode})`, 10000)
      }
    }
  }

  toggleShowSearch = () => {
    this.setState({showSearch: !this.state.showSearch})
  }

  submitCart = async (e) => {
    e.preventDefault();
    this.setState({loading: true})
    let token = this.props.user.authToken

    let reqbody = this.makeReq();
    this.showSuccess("Submitting cart...", 10000)
    if (this.state.itemsInCart == 0) {
      this.showError("Cannot submit: Cart is empty");
      this.setState({loading: false})
      return;
    }
    
    fetch('/api/inventory/CheckoutItems', { method: 'POST',
      body: reqbody,
      headers: {'Content-Type': "application/json", 'Authorization': token}
    })
    .then(resp => {
      if (resp.ok) {
        let items = this.state.items;
        items.clear();
        this.setState({
            items: items,
            itemsInCart: 0,
            error: null,
        })
        this.getDefaultCart();
        document.getElementById("barcode").focus();
      }
      return resp.json()
    })
    .then(json => {
      if (json.error) {
        this.showError(json.error)
      } else if (json.warning) {
        this.showSuccess(json.warning)
      } else {
        this.showSuccess("Cart submitted successfully", 10000)
      }
      this.setState({loading: false})
    });
  }

  displayCartRow = (barcode, value) => {
    return (
      <tr className="h-10 even:bg-gray-50" key={barcode}>
        <td>
          {/* Trash can symbol */}
          <button className="align-middle py-1 focus:outline-none float-left mr-2" tabIndex="-1">
            <img className="w-6 h-6" src="/images/trash-can.svg" onClick={() => this.deleteItem(barcode)}></img>
          </button>
          {/* number spinner [-| 1 |+] */}
          <div className="border border-solid border-gray-200 p-px w-32 h-8 flex flex-row">
            {/* minus */}
            <button className="font-light p-1 bg-gray-200 w-8 h-full text-xl leading-3 focus:outline-none" onClick={() => this.downItemQuantity(barcode, true)} tabIndex="-1">–</button>
            {/* quantity input */}
            <input id={barcode + "-quantity"} className="quantity-input w-6 flex-grow mx-1 text-center focus:outline-none" autoComplete="off"
              value={value[1]} onChange={e => this.updateItemQuantity(barcode, e.target.value)}/>
            {/* plus */}
            <button className="font-light p-1 bg-gray-200 w-8 h-full text-xl leading-3 focus:outline-none" onClick={() => this.upItemQuantity(barcode, true)} tabIndex="-1">+</button>
          </div>
        </td>
        <td className="text-center pr-10">{value[0].itemName}</td>
      </tr>
    )
  }

  closeModal = () => {
    this.setState({showSearch: false});
    setTimeout(() => {
      document.getElementById("barcode").focus();
    }, 0)
  }

  render() {

    /* Hotkeys*/
    const quantityHotkey = "Q", barcodeHotkey = "B", searchHotkey = "F", searchSubmitHotkey = "F";

    document.onkeydown = (e) => {
      var barcode = document.getElementById("barcode");
      var quantity = document.getElementById("quantity");

      /* if modal is open, can navigate with arrow keys and tab */
      if (this.state.showSearch) {
        if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          document.getElementById("search-submit").click();
        }
        return
      }

      /* if focused on cart table*/
      if (document.activeElement.classList.contains("quantity-input")) {
        let barcode = document.activeElement.id.split("-")[0]
        if (e.key === "=" || e.key === "+") { // increment using plus key
          e.preventDefault();
          this.upItemQuantity(barcode);
        } else if (e.key === "-" || e.key === "_") { // decrement using minus key
          e.preventDefault();
          this.downItemQuantity(barcode);
        } else if (e.key === "Enter") {
          e.preventDefault();
          // focus back on the barcode field
          document.getElementById("barcode").focus();
          return;
        } else if (e.key === "ArrowUp" || e.key === "ArrowDown") { // navigate through quantities with arrow keys 
          e.preventDefault();
          let inputs = document.getElementsByClassName("quantity-input")
          let arr = Array.prototype.slice.call(inputs);
          let index = arr.indexOf(document.activeElement);
          if (e.key === "ArrowDown" && index < arr.length - 1) {
            /* focus next quantity-input */
            inputs[index+1].focus(); 
          } else if (e.key === "ArrowUp" && index > 0) {
            /* focus prev quantity-input */
            inputs[index-1].focus();
          }
          return;
        }
      }

      /* hotkeys for item form (left tab) */
      if (!this.state.isEditing) {
        if ((barcodeHotkey.toLowerCase() === e.key.toLowerCase() && document.activeElement.id !== "barcode")
            || e.key == "ArrowUp") {
          e.preventDefault();
          barcode.focus();
        } else if ((quantityHotkey.toLowerCase() === e.key.toLowerCase() && document.activeElement.id !== "barcode")
            || e.key == "ArrowDown") {
          e.preventDefault();
          quantity.focus();
        } else if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          this.submitCart(e);
        } else if (e.key === "Enter") {
          e.preventDefault();
          document.getElementById("checkout-item-form").requestSubmit();
        } else if (e.key.toLowerCase() === searchHotkey.toLowerCase() && document.activeElement.id !== "barcode") {
          e.preventDefault();
          this.toggleShowSearch();
        }
      }
    }

    /* feedback banners */
    const errorBanner = <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">{this.state.error}</div>;
    const successBanner = <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-3">{this.state.success}</div>;

    return (
      <Layout pageName="Checkout">
        <Modal id="search-modal" isOpen={this.state.showSearch} ariaHideApp={false} onRequestClose={this.closeModal}>
          <SearchModal items={this.props.inventory} addItemFunc={this.addItem} onCloseHandler={this.closeModal} submitHotkey={searchSubmitHotkey}/>
        </Modal>

        <div className="flex flex-col h-full lg:flex-row">
          {/* Left-hand column */}
          <div className="flex-none lg:w-64">
            <Sidebar className="sm:min-h-0 lg:min-h-screen">
            
              {/* Barcode & Quantity Form */}
              <form id="checkout-item-form" onSubmit={(e) => this.itemFormSubmit(e)}>
                <h1 className="text-3xl font-medium mb-2">Checkout Item</h1>
                <p className="mb-5 text-sm">Please enter the amount, then scan the item to add it to the cart. Click "Check Out" to submit the cart.</p>
                <div className="form-group" id="barcode-and-quantity">
                  <div className="col-xs-7 mb-4">
                    <h1 className="text-2xl font-medium" autoFocus>Barcode</h1>
                    <p className="text-gray-500 text-xs tracking-normal font-normal mb-2 hidden lg:block">
                      (hotkey: {barcodeHotkey})
                    </p>
                    <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight" id="barcode" autoComplete="off" autoFocus></input>
                  </div>
                  <div className="col-xs-8 mb-4">
                    <h1 className="text-2xl font-medium">Quantity</h1>
                    <p className="text-gray-500 text-xs tracking-normal font-normal mb-2 hidden lg:block">(hotkey: {quantityHotkey})</p>
                    <input className="border rounded w-full py-2 px-3 text-gray-600 leading-tight" id="quantity" autoComplete="off" placeholder="default: 1"></input>
                  </div>
                </div>

                {/* Add Item Button */}
                <button className="my-1 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none" id="add-item-btn" type="submit">
                  Add Item <span className="font-normal hidden lg:inline-block">(Enter)</span>
                </button>
              </form>

              {/* Search Item Button */}
              <div>
                <button className="btn btn-outline w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none" onClick={this.toggleShowSearch}>
                  Search item by name <span className="font-normal hidden lg:inline-block">({searchHotkey})</span>
                </button>
              </div>
            </Sidebar>
          </div>

          {/* Main body (Cart and Checkout Button) */}
          <div className="p-4 container mx-3">
            {this.state.error && errorBanner}
            {this.state.success && successBanner}
            <h1 className="text-3xl font-medium mb-2">Cart</h1>
            <table className="w-full my-5 table-fixed" id="mycart">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left text-lg pl-14">Quantity</th>
                  <th className="text-left w-48 text-lg">
                    <div className="w-32 text-center pl-5">Item</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from( this.state.items ).map(([barcode, value]) => (this.displayCartRow(barcode, value)))}
                <tr className="bg-blue-50 h-10 m-3" key="totals">
                  <td className="text-lg font-medium text-right pr-10">Total Items</td>
                  <td>
                    <div className="w-32 text-center font-medium pl-5">{this.state.itemsInCart}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <button className="btn my-1 btn-pantry-blue uppercase tracking-wide text-xs font-semibold" onClick={(e) => this.submitCart(e)} disabled={this.state.loading}>
              Checkout <span className="font-normal hidden lg:inline-block">(Shift+Enter)</span>
            </button>
          </div>
                      
          {/*Right-hand Column*/}
          <div className="flex-none lg:w-64">
            <Sidebar className="sm:min-h-0 lg:min-h-screen">
            {/* Editing the information */}
            {!this.state.isEditing && <button className='text-blue-700 hover:text-blue-500'
              onClick={() => this.setState({isEditing:true})}>
              edit
            </button>}

            {/* cancel edit */}
            {this.state.isEditing && <button className='text-blue-700 hover:text-blue-500'
              onClick={() => {
                this.setState({isEditing:false});
                fetch(`/api/admin/GetCheckoutInfo`)
                .then((result) => {
                  result.json().then((data) => {
                    this.setState({checkoutInfo:data.markdown})
                  })
                })
              }}>
              cancel
            </button>}

            {/* save edit */}
            {this.state.isEditing && <button className='ml-5 text-blue-700 hover:text-blue-500'
                onClick={async () => {
                let token = this.props.user.authToken
                this.setState({isEditing:false});
                fetch('/api/admin/SetCheckoutInfo', { method: 'POST',
                  body: JSON.stringify({markdown: this.state.checkoutInfo}),
                  headers: {'Content-Type': "application/json", 'Authorization': token}
                }).then((res) => {
                })
              }}>
              save
            </button>}

            {/* show/hide preview */}
            {this.state.isEditing && <button className='ml-5 text-blue-700 hover:text-blue-500'
              onClick={() => {
                this.setState({showPreview:!this.state.showPreview});
              }}>
              {this.state.showPreview ? "hide" : "show"} preview
            </button>}

            {/* Edit message box */}
            {this.state.isEditing &&
              <textarea className="form-control w-full h-64 block px-3 py-1 text-base font-normal text-gray-600 bg-white
                border border-solid border-gray-200 rounded mb-4
              focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" value={this.state.checkoutInfo}
                onChange={(e) => {
                  this.setState({checkoutInfo:e.target.value});
                }}>
              </textarea>}

            {/* Information Display or Preview (rendered markdown) */}
            {(!this.state.isEditing || this.state.showPreview) && this.state.checkoutInfo && <ReactMarkdown className="mb-4 text-zinc-900" components={markdownStyle} children={this.state.checkoutInfo}></ReactMarkdown>}
            </Sidebar>
          </div>
        </div>
      </Layout>
    )
  }
}

// Wrapper for useSWR hook. Apparently can't use hooks in class-style definition for react components.
export default function Checkout() {
  const { data } = useSWR(
    ["/api/admin/GetCheckoutInfo", "/api/inventory/GetAllItems"],
    fetcher
  );
  const { user, loadingUser } = useUser();

  if (loadingUser) {
    return (
      <Layout pageName="Checkout">
          <h1 className='text-xl m-6'>Loading...</h1>
      </Layout>
    )
  }
  
  if (!data || !user) {
    return (
      <Layout pageName="Checkout">
          <h1 className='text-xl m-6'>Sorry, you are not authorized to view this page.</h1>
      </Layout>
    )
  } else {
    return (<Cart inventory={data[1]} checkoutInfo={data[0].markdown} user={user}></Cart>)
  }
}
