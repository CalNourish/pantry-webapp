import Layout from '../components/Layout'
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import Calendar from 'react-modern-calendar-datepicker';
import cookie from 'js-cookie';
import useSWR from 'swr';
import React, { useState, useReducer } from 'react';
export default function Orders() {
  const token = cookie.get("firebaseToken")
  const [selectedDay, setSelectedDay] = useState(null);


  const emptyItem = {
    itemName: "",
    barcode: "",
    count: "",
    packSize: "",
    categoryName: "",
    lowStock: "",
  }

  return (
    <Layout>
      <div class="m-10 container mx-auto items-center">
        <div>
          <form>
            <p>Are you currently unable to come pick up groceries in person at the food pantry in the MLK Student Union?
            </p>
            <p class="text-xs">Answering YES means that you are currently facing a barrier(s) to picking up food on campus and need a delivery.
              Answering NO means that you can come to the pantry on the 1st floor of the MLK Student Union to choose food in person.
              Our hours are currently Tues 1-7pm, Wed 7am-11am, Thurs 5-7pm, Sat 11am-1pm</p>
            <div class="flex flex-col">
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="pantry-status" />
                <span class="ml-2 text-gray-700">Yes</span>
              </label>
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="pantry-status" />
                <span class="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </form>
          <form>
            <p>Are you a student, staff, visiting scholar, or postdoc?</p>
            <div class="flex flex-col">
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="student-status" />
                <span class="ml-2 text-gray-700">Undergrad Student</span>
              </label>
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="student-status" />
                <span class="ml-2 text-gray-700">Graduate Student</span>
              </label>
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="student-status" />
                <span class="ml-2 text-gray-700">Staff</span>
              </label>
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="student-status" />
                <span class="ml-2 text-gray-700">Visiting Scholar</span>
              </label>
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="student-status" />
                <span class="ml-2 text-gray-700">Postdoc</span>
              </label>
            </div>
          </form>
        </div>
        <p>How would you like to order?</p>
        <div class="flex items-center">
          <div class="p-40 bg-white shadow-md items-center">
            <p>Recieve delivered orders within 10 miles of our pantry</p>
          </div>
          <div class="p-40 bg-white shadow-md items-center">
            <p>Pick up your order at our pantry at an alloted time</p>
          </div>
        </div>
        <button class="btn-pantry-blue text-white p-4 flex hover:bg-pantry-blue-700">Submit</button>
        <div>
          <Calendar
            value={selectedDay}
            colorPrimary="#0D325F"
            onChange={setSelectedDay}
          />
          <p>What day(s) / time(s) will you be available to accept a delivery this week?
            Please select all that work, we will send an email for a final confirmation.</p>
          <div class="flex flex-col">
            <label class="inline-flex items-center mt-3">
              <input type="checkbox" class="form-checkbox h-5 w-5 text-pantry-blue-500 " />
              <span class="ml-2 text-gray-700">Tuesday 3-5 PM</span>
            </label>
            <label class="inline-flex items-center mt-3">
              <input type="checkbox" class="form-checkbox h-5 w-5 text-pantry-blue-500 " />
              <span class="ml-2 text-gray-700">Wednesday 1-3 PM</span>
            </label>
            <label class="inline-flex items-center mt-3">
              <input type="checkbox" class="form-checkbox h-5 w-5 text-pantry-blue-500 " />
              <span class="ml-2 text-gray-700">Thursday 4-6 PM</span>
            </label>
          </div>
        </div>
        <div>
          <label class="flex flex-col tracking-tight text-gray-700 w-1/4" for="name"> Name:
            <input type="text" name="name" id="name" placeholder="First name" class="border-2 p-2 rounded-md w-96 focus:bg-white focus:ring-blue-500 focus:border-blue-500" />
            <input type="text" name="name" id="name" placeholder="Last name" class="border-2 p-2 rounded-md w-96 focus:bg-white focus:ring-blue-500 focus:border-blue-500" />
          </label>
          <label class="flex flex-col tracking-tight text-gray-700 w-1/4" for="name"> Cal ID #:
            <input type="text" name="name" id="name" placeholder="Enter Cal ID" class="border-2 p-2 rounded-md w-96 focus:bg-white focus:ring-blue-500 focus:border-blue-500" />
          </label>
          <label class="flex flex-col tracking-tight text-gray-700 w-1/4" for="name"> Address:
            <input type="text" name="name" id="name" placeholder="Street Address or P.O. Box" class="border-2 p-2 rounded-md w-96 focus:bg-white focus:ring-blue-500 focus:border-blue-500" />
            <input type="text" name="name" id="name" placeholder="Apt., suite, unit, building, floor, etc." class="border-2 p-2 rounded-md w-96 focus:bg-white focus:ring-blue-500 focus:border-blue-500" />
            <input type="text" name="name" id="name" placeholder="Zip Code" class="border-2 p-2 rounded-md w-96 focus:bg-white focus:ring-blue-500 focus:border-blue-500" />
          </label>
          <form>
            <p>Do we have your permission to share your information with DoorDash so that they can deliver to you?
              This includes your name, address, phone number, and delivery notes.
            </p>
            <div class="flex flex-col">
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="pantry-status" />
                <span class="ml-2 text-gray-700">Yes</span>
              </label>
              <label class="inline-flex items-center mt-3">
                <input type="radio" class="form-radio h-5 w-5 text-pantry-blue-500" name="pantry-status" />
                <span class="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </form>
        </div>
        <button class="btn-pantry-blue text-white p-4 flex hover:bg-pantry-blue-700">Submit</button>
      </div>

    </Layout>
  );
}

function Delivery() {

  return (
    <Layout>
      <div>Order page</div>
    </Layout>
  )
}