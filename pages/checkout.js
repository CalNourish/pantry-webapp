import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import useSWR from 'swr';
import React from 'react';

import cookie from 'js-cookie';

/* TODO:
  x hotkeys
  x make buttons look nicer
  x make increment/decrement look nicer
  o item search? esp for things with no barcodes
  o small screen spacings
*/

const fetcher = async (...args) => {
  const res = await fetch(...args);
  return res.json();
};

class Cart extends React.Component {
  constructor(props) {
    super(props);

    this.data = props.data;
    this.state = {
      items: new Map([]),   /* entries are {barcode: [itemStruct, quantity]} */
      itemsInCart: 0,
      error: null,
      success: null
    }
  }

  makeReq() {
    let reqbody = {};
    this.state.items.forEach((value, key) => {
        reqbody[key] = value[1];
    })
    return JSON.stringify(reqbody);
  }

  showError(errorText, t) {
    /* show error banner with error text for 5 seconds, or custom time */
    this.setState({
      error: errorText,
      success: null
    });

    t = t ? t : 5000;
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => this.setState({error: null}), t);
  }

  showSuccess(msg, t) {
    /* show error banner with error text for 5 seconds, or custom time */
    this.setState({
      error: null,
      success: msg
    });

    t = t ? t : 5000;
    clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => this.setState({success: null}), t);
  }

  addItem(newItem, quantity) {
    let items = this.state.items;
    let barcode = newItem.barcode;
    if (items.has(barcode)) { /* if item already in table, just increment count */
      var itemData = items.get(barcode)
      itemData[1] += quantity
      items.set(barcode, itemData)
      document.getElementById(barcode+"-quantity").value = itemData[1]; // update the input field
    } else { /* otherwise, create new row in table */
      items.set(newItem.barcode, [newItem, quantity])
    }

    this.setState({
      items: items,
      itemsInCart: this.state.itemsInCart + quantity,
    });
  }

  upItemQuantity(barcode) {
    let items = this.state.items;
    let itemData = items.get(barcode);
    if (!itemData) {
      this.showError("Data corruption: please retry or refresh page", 20000)
      return
    }
    itemData[1] += 1;
    items.set(barcode, itemData);
    this.setState({items: items, itemsInCart: this.state.itemsInCart + 1})
    document.getElementById(barcode+"-quantity").value = itemData[1]; // update the input field
  }

  downItemQuantity(barcode) {
    let items = this.state.items;
    let itemData = items.get(barcode);
    if (!itemData) {
      this.showError("Data corruption: please retry or refresh page", 20000)
      return
    }

    /* Can't decrease item quantity to negative
    *  note: can start with negative quantity using left column form
    *  - possibly in case someone accidentally checked out too much?
    */
    if (itemData[1] <= 0) {
        return;
    }

    itemData[1] -= 1;
    items.set(barcode, itemData);
    this.setState({items: items, itemsInCart: this.state.itemsInCart - 1})
    document.getElementById(barcode+"-quantity").value = itemData[1]; // update the input field
  }

  updateItemQuantity(barcode, newQuantity) {
    let items = this.state.items;
    let itemData = items.get(barcode);
    if (!itemData) {
      this.showError("Data corruption: please retry or refresh page", 20000)
      return
    }

    newQuantity = parseInt(newQuantity)
    if (!isNaN(newQuantity)) {
      let deltaQuantity = newQuantity - itemData[1]; // amount increased by, to recalculate the total sum
      itemData[1] = newQuantity;
      items.set(barcode, itemData);
      this.setState({items: items, itemsInCart: this.state.itemsInCart+deltaQuantity})
    }
  }

  deleteItem(barcode) {
    console.log(`deleting ${barcode}`)
    let items = this.state.items;
    let itemData = items.get(barcode);
    if (!itemData) {
      this.showError("Data corruption: please retry or refresh page", 20000)
        return
    }
    items.delete(barcode);
    this.setState({items: items, itemsInCart: this.state.itemsInCart - itemData[1]})
  }

  itemFormSubmit = (e) => {
    e.preventDefault();
    let barcode = e.target.barcode.value.trim()
    let quantity = parseInt(e.target.quantity.value)
    if (isNaN(quantity)) {
        /* default 1, if no quantity, or quantity is not a number */
        quantity = 1;
    }
    let item = this.data[barcode]
    if (item && item.barcode) {
      this.addItem(item, quantity)
      this.setState({error: null, success: null})
      
      e.target.barcode.value = null;
      e.target.quantity.value = null;
    } else {
      if (!barcode) {
        this.showError("Please enter a barcode in the field to the left.")
      } else {
        this.showError(`Not a valid barcode (${barcode})`, 10000)
      }
    }
  }

  submitCart = async (e) => {
    e.preventDefault();
    const token = cookie.get("firebaseToken")
    // const allowed = await validateFunc(token)
    // console.log(allowed)
    // return;

    let reqbody = this.makeReq();
    this.showSuccess("Submitting cart...", 10000)

    if (this.state.itemsInCart == 0) {
      this.showError("Cannot submit: Cart is empty");
      return;
    }

    const response = await fetch('/api/inventory/CheckoutItems', { method: 'POST',
      body: reqbody,
      headers: {'Content-Type': "application/json", 'Authorization': token}
    })
    // .then(() => {
    if (response.ok) {
      /* clear the cart on successful checkout */
      let items = this.state.items;
      items.clear();
      this.setState({
          items: items,
          itemsInCart: 0,
          error: null,
      })
      this.showSuccess("Cart submitted successfully", 10000)
    } else {
      this.showError("Error submitting cart.");
      return;
    }
  }

  displayCartRow(barcode, value) {
    return (
      <tr className="h-10" key={barcode}>
        <td className="text-left pr-10">{value[0].itemName}</td>
        <td className="">
          {/* stepper */}
          <div className="border border-solid border-gray-300 p-px w-32 h-8 flex flex-row float-left">
            {/* minus */}
            <button className="font-light p-1 bg-gray-300 w-8 h-full text-xl leading-3 focus:outline-none" onClick={() => this.downItemQuantity(barcode)}>–</button>
            {/* input */}
            <input id={barcode + "-quantity"} className="w-6 flex-grow mx-1 text-center focus:outline-none" autoComplete="off"
              defaultValue={value[1]} onChange={e => this.updateItemQuantity(barcode, e.target.value)}/>
            {/* plus */}
            <button className="font-light p-1 bg-gray-300 w-8 h-full text-xl leading-3 focus:outline-none" onClick={() => this.upItemQuantity(barcode)}>+</button>
          </div>
          {/* Trash can symbol */}
          <button className="float-right align-middle py-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" onClick={() => this.deleteItem(barcode)}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </td>
        {/* <td className="" onClick={() => this.deleteItem(barcode)}>          
        </td> */}
      </tr>
    )
  }

  render() {
    const errorBanner = <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">{this.state.error}</div>;
    const successBanner = <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-3">{this.state.success}</div>;

    const cartSubmit = this.submitCart;
    // const itemSubmit = this.itemFormSubmit;

    document.onkeydown = function(e){
      var barcode = document.getElementById("barcode");
      var quantity = document.getElementById("quantity");

      if (["ArrowUp", "q", "Q"].includes(e.key)) {
        e.preventDefault();
        barcode.focus();
      }
      else if (["ArrowDown", "w", "W"].includes(e.key)) {
        e.preventDefault();
        quantity.focus();
      }
      else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        cartSubmit(e);
      } else if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("add-item-btn").click();
        // is there a better way to do this...
      }
    }

    return (
      <>
        <Layout>
          <div className="flex h-full">
            {/* Left-hand column (Barcode and Quantity form) */}
            <div className="flex-none w-64">
              <Sidebar>
              <form className="sticky top-0 py-4" id="checkout-item-form" onSubmit={(e) => this.itemFormSubmit(e)}>
                  <h1 className="text-3xl font-semibold mb-2">Checkout Item</h1>
                  <p className="mb-5">Please enter the amount, then scan the item to add it to the cart. Click "Check Out" to submit the cart.</p>
                  <div className="form-group" id="barcode-and-quantity">
                    <div className="col-xs-7 mb-4">
                      <h1 className="text-2xl font-medium" autoFocus>Barcode</h1>
                      <p className="text-gray-600 text-xs tracking-normal font-normal mb-2">
                        (hotkey: Q)
                      </p>
                      <input className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="barcode" autoComplete="off" placeholder=""></input>
                    </div>
                    <div className="col-xs-8 mb-4">
                      <h1 className="text-2xl font-medium">Quantity</h1>
                      <p className="text-gray-600 text-xs tracking-normal font-normal mb-2">(hotkey: W)</p>
                      <input className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="quantity" autoComplete="off" placeholder="default: 1"></input>
                    </div>
                  </div>
                  <button className="my-1 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold" id="add-item-btn" type="submit">Add Item (Enter)</button>
                </form>
              </Sidebar>
            </div>

            {/* Main body (Cart and Checkout Button) */}
            <div className="p-5 container mx-auto">
              {this.state.error && errorBanner}
              {this.state.success && successBanner}
              <h1 className="text-3xl font-medium mb-2">Cart</h1>
              <table className="w-full my-5 table-fixed" id="mycart">
                <thead>
                  <tr className="border-b-2">
                    <th className="w-auto text-left">Item</th>
                    <th className="text-left w-48">
                      <div className="w-32 text-center">Quantity</div>
                    </th>
                    {/* <th className="w-5 flex-grow-0"></th> */}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Array.from( this.state.items ).map(([barcode, value]) => (this.displayCartRow(barcode, value)))}
                  <tr className="bg-gray-200 h-10 m-3" key="totals">
                    <td className="text-lg font-medium text-right pr-10">Total Items</td>
                    <td>
                      <div className="w-32 text-center font-medium">{this.state.itemsInCart}</div>
                    </td>
                    {/* <td></td> */}
                  </tr>
                </tbody>
              </table>
              <button className="btn my-1 btn-pantry-blue uppercase tracking-wide text-xs font-semibold" onClick={(e) => this.submitCart(e)}>Checkout (Shift+Enter)</button>
            </div>
          </div>
        </Layout>
      </>
    )
  }
}


// Wrapper for useSWR hook. Apparently can't use hooks in class-style definition for react components.
export default function Checkout() {
  const { data } = useSWR("/api/inventory/GetAllItems", fetcher);

  if (!data) {
    return (<div>loading...</div>)
  } else {
    return (<Cart data={data}></Cart>)
  }
}