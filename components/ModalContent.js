// create a form for edit (scan barcode) and add item wothout any db reads/writes
// get the info from the form into correct ofrmat to write to db
// style the page
// merge work into master and branch again to incorporate sam work
// make db call 
import { useForm } from "react-hook-form";

export default function ModalContent(close) {
    const { register, handleSubmit, watch, errors } = useForm();
    const onSubmit = data => {
        console.log(data);
        // write to firebase
    }

    console.log(watch("example")); // watch input value by passing the name of it

    return (
        <div className="modal-wrapper">
            <div className="modal-content">
                <div className="modal-body">
                </div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='p-1'>
                            <label className="p-2">Item Name</label>
                            <input type="text" name="itemName" required ref={register}/>
                        </div>
                        <div className="p-1">
                            <label className="p-2">Item Barcode</label>
                            <input type="text" name="itemBarcode" required ref={register}/>
                        </div>
                        <div className='p-1'> 
                            <label className="p-2">Stock Count</label>
                            <input type="number" min="0" name="count" required ref={register}/>
                        </div>
                        <div className='p-1'>
                            <label className="p-2">Pack Size</label>
                            <input type="number" min="0" name="packSize" required ref={register}/>
                        </div>
                        <div className='p-1'>
                            <label className="p-2">Low Stock Threshold</label>
                            <input type="number" min="0" name="lowStock" required ref={register}/>
                        </div>
                        <div className='p-3' >
                            <button className="bg-gray-300 p-2 rounded-md" type="submit">Submit</button>
                        </div>
                    </form> 
                </div>
            </div>
        </div>
    )
  }