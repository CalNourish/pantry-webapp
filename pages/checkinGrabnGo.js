import Layout from '../components/Layout.js'
import React from 'react';

import { useUser } from '../context/userContext.js'
import { server } from './_app.js'

const fetcher = (url) => fetch(url).then((res) => res.json())


class Checkin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      success: null,
      lastScannedID: "N/A",
      lastMealCount: null,
      visitsLastWeek: [],
      lastScannedTime: "N/A",
      referred: ["3039256430", "3036634046", "3039181004", "3039227817", "3039257249", "3039209968", "3039084947", "3035933900", "3033882739", "3039079266", "3039221239", "11325345", "3039121438", "3038120334", "3035833839", "3034907240", "3040544172", "3037996873", "3040345545", "3040430617", 
        "3039851584", "3037660758", "3040512426", "3038094646", "3039117486", "3037976359", "3040574163", "3040559590", "3040413574", "3037860412", "3037415289", "3040430617", "3040338278", "3040565635", "3040332974", "3040438118", "3040390499", "3040519303", "3034359553", "3040493303", 
        "3040323731", "3040767109", "3038331389", "3040485802", "3037810453", "3040564504", "3032972321", "3040335366", "3037071832", "3040383544", "3040469604", "3036846453", "3040331570", "3040457722", "3040514610", "3040501025", "3040430058", "3040836204", "3040501506", "3040496189", 
        "3040388653", "3038327606", "3038068438", "3038054437", "3040526167", "3040345597", "3040424169", "3039101756", "3040509202", "3040455876", "3037627413", "3040863010", "3037282270", "3040560877", "3037765148", "3040542664", "3038366216", "3040388328", "3040369478", "3039335171", 
        "3039431917", "3036252725", "3037242795", "3039270756", "3039482253", "3039449740", "3039369868", "3039309132", "3035051891", "3038851792", "3038900204", "3039393476", "3037255592", "3040611850", "3039821801", "3036120944", "3038441642", "3036066058", "3040822710"]
    }
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
    document.getElementById("calIDFieldset").disabled = false;
    document.getElementById("mealCountFieldset").disabled = false;
    if (errorText.includes("ID")) {
      document.getElementById("calID").focus();
    } else {
      document.getElementById("mealCount").focus();
    }
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
    document.getElementById("calIDFieldset").disabled = false;
    document.getElementById("mealCountFieldset").disabled = false;
    document.getElementById("calID").focus();

  }

  
  showLastScannedInfo = () => {
    if (this.state.lastScannedID == "N/A") {
      return <div className='flex-grow text-left'>Last Scanned ID: {this.state.lastScannedID}</div>
    }
    else {
      return (
        <>
        <div className='flex-grow text-left'>Last Scanned ID: {this.state.lastScannedID} with {this.state.lastMealCount} meal(s) at {this.state.lastScannedTime}.</div>
        </>
      )
    }
  };


  overrideHandler = () => {
    this.writeIDandMealsToSheet(this.state.lastScannedID, this.state.lastMealCount);
    this.setState({lastScannedID: "N/A", lastMealCount: null,
    visitsLastWeek: [], lastScannedTime: "N/A"});
    this.showLastVisitInfo();
  }

  showLastVisitInfo = () => {
    var messageToReturn = ""
    if (this.state.lastScannedID == "N/A") {
      return <div className='flex-grow'>{messageToReturn}</div>;
    }
    else {
      if (this.isReferred(this.state.lastScannedID)) {
        messageToReturn = "This visitor is a referred student."
      } else {
        messageToReturn = "This visitor is NOT a referred student."
      }
      return (
        <>
        <div className='flex-grow text-left'>{messageToReturn}</div>
        {/* Override Button */}
        {/* <button type="submit" id = "submitButton" className="btn my-1 btn-pantry-blue uppercase tracking-wide text-xs font-semibold flex-grow disabled:bg-pantry-blue-400" onClick={() => {this.overrideHandler()}}>
        Override
        </button> */}
        </>
      )

    }  
  };

  writeIDandMealsToSheet = async (id, meals) => {
    fetch('/api/admin/WriteCheckIn', { 
      method: 'POST',
      body: JSON.stringify({ calID: id, mealCount: meals, isGrabnGo: true }),
      headers: {
        'Content-Type': "application/json",
        'Authorization': this.props.user.authToken
      }
    })
    .then(() => {
      if (this.isReferred(id)) {
        this.showSuccess("ID: " + id + " is a referred student.", 5000)
      } else {
      this.showSuccess("ID: " + id + " is NOT a referred student.", 5000)
  }})
  }

  validateCalId = (calIdValue) => {
    const regexes = { 
      'isStudent': /^(30\d{8}|[1278]\d{7})$/,
      'isEmployeeOrAffiliate': /^(01\d{6}|10\d{6})$/,
      'isValidEncrypted': /^810:\d{8}$/,
      'isCommunity': /^1$/
    };
  
    if (calIdValue.trim() === '') {
      this.showError("Can't submit blank ID: " + calIdValue, 1000);
      return false;
    }
  
    for (const regex in regexes) {
      if (regexes[regex].test(calIdValue)) {
        return true;
      }
    }
  
    this.showError("Invalid ID. Please try again.");
    return false;
  }
   
  validateMealCount = (mealCount) => {
      const regexes = {
        'notNull': /^\d$/
      }

      if (mealCount == null) {
        this.showError("Can't submit blank Meal Count: " + mealCount, 1000);
        return false;
    }
    
    for (const regex in regexes) {
      if (regexes[regex].test(mealCount)) {
        return true;
      }
    }
  
    this.showError("Invalid Meal Count. Please try again.");
    return false;
    };

  updateID = (id) => {
      if (['3', '4', '5', '6'].includes(id[0]) && id.length == 8) {
        return '30' + id;
    } return id; };

  isReferred = (id) => {
      if (this.state.referred.includes(id)) {
        return true;
    } return false; };


  handleScanSubmit = async (e) => {
    var IdFieldset = document.getElementById("calIDFieldset");
    var mealFieldset = document.getElementById("mealCountFieldset");
    IdFieldset.disabled = true;
    mealFieldset.disabled = true;
    e.preventDefault();

    var { value: calIdValue } = e.target.calID;
    var calIdValue = this.updateID(calIdValue);
    const { value: mealCountValue } = e.target.mealCount;
    if (!this.validateCalId(calIdValue) || !this.validateMealCount(mealCountValue)) {
      return;
    }

    // Directly update the state and proceed with other actions
    this.setState({
      lastScannedID: calIdValue,
      lastMealCount: mealCountValue,
      visitsLastWeek: [], // Placeholder if you need this state, otherwise you can remove it
      lastScannedTime: new Date().toLocaleTimeString()
    });

    this.writeIDandMealsToSheet(calIdValue, mealCountValue);

    document.getElementById("calID").value = null;
    document.getElementById("mealCount").value = null;
    document.getElementById("calID").focus();  

  }

  

  render() {
  /* feedback banners */
  const errorBanner = <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">{this.state.error}</div>;
  const successBanner = <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-3">{this.state.success}</div>;


  document.onkeydown = (e) => {
    if (!document.activeElement.classList.contains("calID") && !document.activeElement.classList.contains("mealCount") && !isNaN(e.key)) {
      e.preventDefault();
      if (document.activeElement.closest("calIDFieldset")) {
        document.getElementById("calID").value = e.key;
      } else {
        document.getElementById("mealCount").value = e.key;

      }
    }
  }

  return (
    <Layout pageName="GrabnGo Check-In">
      <div className='m-6'>
      {this.state.error && errorBanner}
      {this.state.success && successBanner}
        <h1 className='text-3xl font-medium mb-2'>GrabnGo Check-In</h1>
        
        <div className='flex flex-row space-x-16 my-8'>
          <form onSubmit={(e) => this.handleScanSubmit(e)}>
            
            <fieldset id="calIDFieldset" disabled={false}>
            <div>
            <div className='flex-grow'>Use scanner or manually enter Cal ID (put 1 if general community member)</div>
            <input className="calID border rounded w-2/3 py-2 px-3 text-gray-600 leading-tight"
              placeholder="Cal ID"
              id="calID" autoComplete="off" autoFocus></input>
            </div>
            </fieldset>

            <fieldset id="mealCountFieldset" disabled={false}>
            <div>
            <div className='flex-grow'>Number of Meals</div>
            <input className="NumberOfMeals border rounded w-2/3 py-2 px-3 text-gray-600 leading-tight"
              placeholder="# of Meals"
              id="mealCount" autoComplete="off" autoFocus></input>
            </div>
            <input type="submit" id = "submitButton" className="btn my-1 btn-pantry-blue uppercase tracking-wide text-xs font-semibold flex-grow disabled:bg-pantry-blue-400" value="Submit (Enter)" />
            </fieldset>
            
          </form>
          <div className = "w-1/3">
          
          {this.showLastScannedInfo()}
          {this.showLastVisitInfo()}
        </div>
        </div>
      </div>
    </Layout>
  )
  }
}


export default function checkinGrabnGo() {
  const { user, loadingUser } = useUser();

  /* Display loading message */
  if (loadingUser) {
    return (
      <Layout pageName="Checkout">
        <h1 className='text-xl m-6'>Loading...</h1>
      </Layout>
    )
  }

  let authToken = (user && user.authorized) ? user.authToken : null;
  if (!authToken) {
    return (
      <Layout pageName="GrabnGo Check-In">
        <h1 className='text-xl m-6'>Sorry, you are not authorized to view this page.</h1>
      </Layout>
    )
  }
  else {
    return (<Checkin user={user}></Checkin>)
  }
}
