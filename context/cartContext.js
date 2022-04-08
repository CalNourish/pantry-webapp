import { useReducer, createContext } from "react";

export const DispatchCartContext = createContext();
export const StateCartContext = createContext(); 

/** 
 * Cart Actions
 * UPDATE_CART: updates an items quantity in the cart
 * REMOVE_ITEM: removes an item completely from the cart
 * CLEAR_CART: removes all items from cart
 */ 
export const ACTIONS = {
  UPDATE_CART: "UPDATE_CART",
  REMOVE_ITEM: "REMOVE_ITEM",
  CLEAR_CART: "CLEAR_CART",
  UPDATE_PERSONAL: "UPDATE_PERSONAL",
  UPDATE_DELIVERY: "UPDATE_DELIVERY"
};

/**
 * Example state
 * cart: {
 *   itemId: {
 *     ...item,
 *     quantity: integer
 *   }
 * },
 * 
 * personal: {
 *   first:
 *   last:
 *   calID:
 *   email:
 *   emailConf:
 *   status:
 * },
 * 
 * delivery: {
 *   streetAddress:
 *   address2:
 *   city:
 *   zip:
 *   withinCA:
 *   phone:
 *   deliveryNotes:
 *   doordashConf:
 * }
 */ 
const initialState = {
  personal: {
   first:"", last:"", calID:"", email:"", emailConf:"", status:""
  },
  delivery: {
    streetAddress:"", address2:"", city:"", zip:"", withinCA:"", phone:"", notes:"", doordashConf:""
  },
  cart: {}
};

// Updates the quantity of an item in the cart
const updateCart = (item, quantity, state) => {
  const updatedCart = { ...state.cart };
  quantity = isNaN(quantity) ? 0 : parseInt(quantity) // default 0 if not parse-able
  if (!(item.barcode in updatedCart) && quantity > 0) {
    // If item is not in cart and quantity is greater than 0
    // add to cart
    updatedCart[item.barcode] = { ...item, quantity}
  } else if (quantity <= 0) {
    // remove from cart
    delete updatedCart[item.barcode]
  } else {
    // update quantity of item in cart
    updatedCart[item.barcode]['quantity'] = quantity
  }
  return { ...state, cart: updatedCart };
}

// Removes item from cart
const removeItemFromCart = (item, state) => {
  const updatedCart = { ...state.cart };
  if (item.barcode in updatedCart) {
    delete updatedCart[item.barcode]
  }
  return { ...state, cart: updatedCart };
}

// Completely resets cart
const clearCart = (state) => {
  return { ...state, cart: {} }
}

const updatePersonal = (info, state) => {
  const updatedPersonal = { ...state.personal, ...info}
  return {...state, personal: updatedPersonal}
}

const updateDelivery = (info, state) => {
  const updatedDelivery = { ...state.delivery, ...info}
  return {...state, delivery: updatedDelivery}
}

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.UPDATE_CART:
      return updateCart(action.payload.item, action.payload.quantity, state)
    case ACTIONS.REMOVE_ITEM:
      return removeItemFromCart(action.payload.item, state)
    case ACTIONS.CLEAR_CART:
      return clearCart(state)
    case ACTIONS.UPDATE_PERSONAL:
      return updatePersonal(action.payload, state)
    case ACTIONS.UPDATE_DELIVERY:
      return updateDelivery(action.payload, state)
    default:
      throw new Error(`Unhandled action type: ${action.type}`)
  }
};
const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
      <StateCartContext.Provider value={state}>
        <DispatchCartContext.Provider value={dispatch}>
          {children}
        </DispatchCartContext.Provider>
      </StateCartContext.Provider>
    );
};

export default CartProvider