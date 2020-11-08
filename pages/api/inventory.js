import firebase from '../../firebase/clientApp'

// function Item(name, barcode, count, categories, is_favorite=false) {
//   this.name = name;
//   this.barcode = barcode;
//   this.count = count;
//   this.categories = categories;
//   this.is_favorite = is_favorite; // true or false
// }

export default (req,res) => {
  const ALL_ITEMS = []
  firebase
    .database()
    .ref('/inventory')
    .once("value", snapshot => {
      let response = snapshot.val()
      return res.status(200).json(response)
      // for (let item in res) {
      //   let currentItem = res[item]
      //   let category_dict = currentItem.categoryName
      //   let categories = []
      //   for (let category in category_dict) {
      //     categories.push(category)
      //   }
      //   ALL_ITEMS.push({
      //     "name": currentItem.itemName,
      //     "barcode": currentItem.barcode,
      //     "count": currentItem.count,
      //     "categories": currentItem.categories,
      //     "is_favorite": currentItem.is_favorite
      //   })
  });
}