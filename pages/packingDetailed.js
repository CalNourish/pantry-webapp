import Layout from "../components/Layout";
import useSWR from "swr";
import { useRouter } from "next/router";
import React from "react";
import { useUser } from '../context/userContext'

import {
  ORDER_STATUS_COMPLETE,
  ORDER_STATUS_OPEN,
  ORDER_STATUS_PROCESSING,
} from "../utils/orderStatuses";


function fetcher(token, ...urls) {
  const f = async (u) => {
    if (token) {
      const res = await fetch(u, {
        headers: { "Content-Type": "application/json", Authorization: token },
      });

      return res.json().then((resp) => {
        if (!res.ok) {
          return Promise.reject(resp)
        }
        return Promise.resolve(resp)
      });
    }
    return Promise.resolve({})
  }

  if (urls.length > 1) {
    return Promise.all(urls.map(f));
  }
  return f(urls);
}

class PackingOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user,
      orderId: props.data[0].orderId,
      delivery_date: props.data[0].deliveryDate,
      dependents: props.data[0].dependents,
      dietaryRestriction: props.data[0].dietaryRestriction ? props.data[0].dietaryRestriction : "N/A",
      pantryNote: props.data[0].pantryNote,
      guestNote: props.data[0].guestNote ? props.data[0].guestNote : "N/A",
      firstName: props.data[0].firstName,
      lastInitial: props.data[0].lastInitial,
      status: props.data[0].status,
      order_timestamp: props.data[0].order_timestamp,
      items: props.data[0].items,
      itemMap: props.data[1],
      error: null,
      success: null,
    };
  }

  savePantryNote = (newPantryNote = this.state.pantryNote) => {
    this.state.pantryNote = newPantryNote;
    this.setState({ pantryNote: this.state.pantryNote });
    fetch("/api/orders/SetPantryNote", {
      method: "POST",
      body: JSON.stringify({
        orderId: this.state.orderId,
        message: this.state.pantryNote,
      }),
      headers: { "Content-Type": "application/json", Authorization: this.state.user.authToken },
    }).then(() => {
      this.setState({ success: "Saved pantry note successfully!" });
      setTimeout(() => this.setState({ success: null }), 1000);
    });
  };

  cancelPantryNote = () => {
    if (this.state.pantryNote !== undefined) {
      document.getElementById("pantry_note").value = this.state.pantryNote;
    }
  };

  changeOrderStatus = () => {
    var newStatus = "";
    if (this.state.status == ORDER_STATUS_OPEN) {
      newStatus = ORDER_STATUS_PROCESSING;
    } else if (this.state.status == ORDER_STATUS_PROCESSING) {
      newStatus = ORDER_STATUS_COMPLETE;
    } else {
      newStatus = ORDER_STATUS_PROCESSING;
    }
    this.setState({ status: newStatus });
    fetch("/api/orders/SetOrderStatus", {
      method: "POST",
      body: JSON.stringify({
        orderId: this.state.orderId,
        status: newStatus,
      }),
      headers: { "Content-Type": "application/json", Authorization: this.state.user.authToken },
    }).then(() => {
      this.setState({ success: "Changed order status successfully!" });
      setTimeout(() => this.setState({ success: null }), 1000);
    });
  };

  changeStatusOfItem(barcode, quantity, decreaseItemCount = false) {
    this.state.items[barcode].isPacked = !this.state.items[barcode].isPacked;
    this.setState({ items: this.state.items });
    fetch("/api/orders/SetOrderItemStatus", {
      method: "POST",
      body: JSON.stringify({
        orderId: this.state.orderId,
        itemId: barcode,
        isPacked: this.state.items[barcode].isPacked,
        decreaseItemCount: decreaseItemCount,
        quantity: quantity
      }),
      headers: { "Content-Type": "application/json", Authorization: this.state.user.authToken },
    })
    .then(() => {
      setTimeout(() => this.setState({ success: null }), 1000);
    })
    .catch((error) => {
      this.setState({ error: "Error packing item: " + error});
      setTimeout(() => this.setState({ error: null }), 1000);
    });
  }

  displayUnpackedItemRow(barcode, value) {
    var itemName = this.state.itemMap[barcode]?.itemName;
    if (itemName) {
      return (
        <tr className="h-10" key={barcode}>
          <td className="">
            <div className="float-left">
              <button
                className="font-bold text-xl"
                onClick={() => this.changeStatusOfItem(barcode, value.quantity, true)}
              >
                {itemName}
              </button>
            </div>
          </td>
          <td>
            <h2 className="float-left text-xl">{value.quantity}</h2>
          </td>
        </tr>
      );
    }
  }

  displayPackedItemRow(barcode, value) {
    var itemName = this.state.itemMap[barcode]?.itemName;
    if (itemName) {
      return (
        <tr className="h-10" key={barcode}>
          <td className="">
            <div className="float-left">
              <button
                className="font-bold text-xl line-through"
                onClick={() => this.changeStatusOfItem(barcode, value.quantity, true)}
              >
                {itemName}
              </button>
            </div>
          </td>
          <td>
            <h2 className="line-through float-left text-xl">{value.quantity}</h2>
          </td>
        </tr>
      );
    }
  }

  displayOrderStatus() {
    if (this.state.status == ORDER_STATUS_COMPLETE) {
      return (
        <h1 className="inline font-bold text-l pl-2">
          Status:
          <span>&#9989;</span>
        </h1>
      );
    } else if (this.state.status == ORDER_STATUS_OPEN) {
      return (
        <h1 className="inline font-bold text-l pl-2">
          Status:
          <span>&#9898;</span>
        </h1>
      );
    } else if (this.state.status == ORDER_STATUS_PROCESSING) {
      return (
        <h1 className="inline font-bold text-l pl-2">
          Status:
          <span>&#9881;</span>
        </h1>
      );
    }
  }

  displayChangeOrderStatus() {
    var textForButton = "";
    const blueButtonClass = "float-right font-bold btn btn-pantry-blue"

    if (this.state.status == ORDER_STATUS_COMPLETE) {
      textForButton = "Mark as incomplete";
      return (
        <button
          className="float-right font-bold btn btn-outline"
          onClick={() => this.changeOrderStatus()}
        >
          {textForButton}
        </button>
      );
    } else if (this.state.status == ORDER_STATUS_OPEN) {
      textForButton = "Mark as processing";
      return (
        <button
          className={blueButtonClass}
          onClick={() => this.changeOrderStatus()}
        >
          {textForButton}
        </button>
      );
    } else if (this.state.status == ORDER_STATUS_PROCESSING) {
      textForButton = "Mark as complete";
      return (
        <button
          className={blueButtonClass}
          onClick={() => this.changeOrderStatus()}
        >
          {textForButton}
        </button>
      );
    }
    return (
      <button
          className={blueButtonClass}
          onClick={() => this.changeOrderStatus()}
      >
        {textForButton}
      </button>
    );
  }

  displayNoItemTable() {
    return (
      <tbody><tr><td>
        <h1 className="text-xl">No items placed in order :(</h1>
      </td></tr></tbody>
    )
  }

  displayItemTable() {
    if (Object.entries(this.state.items).length > 0) {
      return (
        <tbody className="divide-y">
          {Object.entries(this.state.items).map(([barcode, value]) => {
            if (this.state.items[barcode] !== null) {
              return this.state.items[barcode].isPacked
              ? this.displayPackedItemRow(barcode, value)
              : this.displayUnpackedItemRow(barcode, value)
            }
          }
          )}
        </tbody>
      );
    } else {
      this.displayNoItemTable();
    }
  }

  render() {
    const errorBanner = (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
        {this.state.error}
      </div>
    );
    const successBanner = (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-3">
        {this.state.success}
      </div>
    );

    return (
      <>
        <Layout pageName={`${this.state.firstName} ${this.state.lastInitial}'s Order`}>
          <div className="flex h-full">
            <div className="w-1/4 bg-gray-100 items-center p-5">
              <h1 className="text-xl">Pantry Note</h1>
              <textarea
                className="form-control w-full text-base font-normal text-gray-600 bg-white bg-clip-padding border border-solid border-gray-200 rounded transition ease-in-out m-0 focus:text-gray-600 focus:bg-white focus:border-blue-600 focus:outline-none"
                id="pantry_note"
                rows="4"
                placeholder="Leave a note here for other pantry workers!"
                defaultValue={this.state.pantryNote}
              >
              </textarea>
              <div>
                <React.Fragment>
                  <button
                    className="btn btn-pantry-blue mr-2"
                    onClick={() =>
                      this.savePantryNote(
                        document.getElementById("pantry_note").value
                      )
                    }
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => this.cancelPantryNote()}
                  >
                    Cancel
                  </button>
                </React.Fragment>
              </div>
            </div>
            <div className="w-3/4 m-5 space-x-10 space-y-5">
              {this.state.error ? errorBanner : null}
              {this.state.success ? successBanner : null}
              <h1 className="inline text-2xl font-medium mb-2">
                {this.state.firstName + " " + this.state.lastInitial}{" "}
              </h1>
              <div className="inline items-center space-x-4">
                {this.displayOrderStatus()}
                {this.displayChangeOrderStatus()}
              </div>
              <div className="flex space-x-11">
                <div className="text-large font-medium">
                {"Dependents: " + this.state.dependents}
              </div>
              <div className="text-large font-medium">
                {"Dietary Restrictions: " + this.state.dietaryRestriction}
              </div>
              <div className="text-large font-medium">
                {"Additional Note: " + this.state.guestNote}
              </div>
              </div>
              <table className="w-full table-fixed" id="order">
                <thead>
                  <tr className="border-b-2">
                    <th className="w-auto text-left">Item</th>
                    <th className="w-1/6 text-left">Quantity</th>
                    <th className="w-5"></th>
                  </tr>
                </thead>
                {this.state.items != null
                  ? this.displayItemTable()
                  : this.displayNoItemTable()}
              </table>
            </div>
          </div>
        </Layout>
      </>
    );
  }
}

export default function PackingDetailed() {
  const { user, loadingUser } = useUser();
  let authToken = (user && user.authorized) ? user.authToken : null;

  const router = useRouter();
  var orderId = router.query.orderid;

  const { data, error } = useSWR(
    [authToken, "/api/orders/GetOrder/" + orderId, "/api/inventory/GetAllItems"],
    fetcher
  );

  if (orderId == null || orderId == "") {
    return (
      <Layout pageName="Orders">
        <h1 className='text-xl m-6'>No Order Id provided</h1>
      </Layout>
    );
  }

  if (loadingUser) {
    return (
      <Layout pageName="Inventory">
          <h1 className='text-xl m-6'>Loading...</h1>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout pageName="Orders">
          <h1 className='text-xl m-6'>{error.error}</h1>
      </Layout>
    )
  }

  if (!data) {
    return (
      <Layout pageName="Orders">
        <h1 className='text-xl m-6'>Loading...</h1>
      </Layout>
    );
  } else {
    return <PackingOrder user={user} data={data}></PackingOrder>;
  }
}