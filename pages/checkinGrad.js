import Layout from '../components/Layout'
import React from 'react';

import { useUser } from '../context/userContext'
import { server } from './_app.js'

const fetcher = (url) => fetch(url).then((res) => res.json())


class Checkin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user:props.user,
      error: null,
      success: null,
      lastScannedID: "N/A",
      visitsLastWeek: [],
      lastScannedTime: "N/A"
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
    document.getElementById("calID").focus();
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
    document.getElementById("calID").focus();
  }

  
  showLastScannedInfo = () => {
    if (this.state.lastScannedID == "N/A") {
      return <div className='flex-grow text-left'>Last Scanned ID: {this.state.lastScannedID}</div>
    }
    else {
      return (
        <>
        <div className='flex-grow text-left'>Last Scanned ID: {this.state.lastScannedID} at {this.state.lastScannedTime}.</div>
        </>
      )
    }
  };


  overrideHandler = () => {
    this.writeIDtoSheet(this.state.lastScannedID);
    this.setState({lastScannedID: "N/A",
    visitsLastWeek: [], lastScannedTime: "N/A"});
    this.showLastVisitInfo();
  }

  showLastVisitInfo = () => {
    var messageToReturn = ""
    if (this.state.lastScannedID == "N/A") {
      return <div className='flex-grow'>{messageToReturn}</div>;
    }
    else {
      var numVisits = this.state.visitsLastWeek.length
      if (numVisits == 0) {
        messageToReturn= "This visitor has not visited the pantry this week."  
        return <div className='flex-grow text-left'>{messageToReturn}</div>;
      }
      else if (numVisits == 1) {
        messageToReturn= "This visitor has already visited the pantry this week on  " + this.state.visitsLastWeek[0] +"."
      }
      else if (numVisits == 2) {
        messageToReturn= "This visitor has already visited the pantry twice this week on  " + this.state.visitsLastWeek[0] + " and " + this.state.visitsLastWeek[1] + "."
      }
      else if (numVisits > 2) {
        var messageToReturn = "This visitor has visited the pantry multiple times this week on "
        for (var i = 0; i < numVisits; i++) {
          if (i == numVisits - 1) {
            messageToReturn = messageToReturn + this.state.visitsLastWeek[i] +"."
          }
          else if (i == numVisits - 2) {
            messageToReturn = messageToReturn + this.state.visitsLastWeek[i] +", and "
          }
          else {
            messageToReturn = messageToReturn + this.state.visitsLastWeek[i] +", "
          }
        }
      }
      return (
        <>
        <div className='flex-grow text-left bg-amber-400'>{messageToReturn}</div>
        <button type="submit" id = "submitButton" className="btn my-1 btn-pantry-blue uppercase tracking-wide text-xs font-semibold flex-grow disabled:bg-pantry-blue-400" onClick={() => {this.overrideHandler()}}>
        Override
        </button>
        </>
      )

    }  
  };

  writeIDtoSheet = async (id) => {
    fetch('/api/admin/WriteCheckIn', { method: 'POST',
    body: JSON.stringify({calID: id, isGrad:true}),
    headers: {'Content-Type': "application/json", 'Authorization': this.state.user.authToken}
    })
    .then(() => {
      this.showSuccess("Sucessfully logged ID: " + id,1000)
    })
  }
   
  handleScanSubmit = async (e) => {
    var fieldset = document.getElementById("calIDFieldset")
    fieldset.disabled = true
    e.preventDefault();
    if (e.target.calID.value.length == 0 || e.target.calID.value == null) {
      this.showError("Can't submit blank ID: " + e.target.calID.value,1000)
      return
    }
    fetch('/api/admin/CheckPreviousVisit', { method: 'POST',
      body: JSON.stringify({calID: e.target.calID.value, isGrad:true}),
      headers: {'Content-Type': "application/json", 'Authorization': this.state.user.authToken}
    })
    .then((result) => {
      result.json()
      .then((lastVisitedTimes) => {
        if (lastVisitedTimes.error) {
          this.showError(lastVisitedTimes.error)
        }
        else {
          this.setState({lastScannedID:e.target.calID.value, visitsLastWeek:lastVisitedTimes, lastScannedTime:new Date().toLocaleTimeString()})
          if (lastVisitedTimes.length == 0) {
            this.writeIDtoSheet(e.target.calID.value)
          }
          else {
            this.showError("Failed scanning ID: " + e.target.calID.value + ". This visitor has visited already.",3000)
          }
          document.getElementById("calID").value = null;
          document.getElementById("calID").focus();
        }
      })
      .catch((err) => {
        this.showError("Failed scanning ID: " + e.target.calID.value + err,3000)
      });
    })
    .catch((err) => {
      this.showError("Failed scanning ID: " + e.target.calID.value + err,300)
    })
    
  
  }

  

  render() {
  /* feedback banners */
  const errorBanner = <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">{this.state.error}</div>;
  const successBanner = <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-3">{this.state.success}</div>;


  document.onkeydown = (e) => {
    if (!document.activeElement.classList.contains("calID") && !isNaN(e.key)) {
      e.preventDefault();
      document.getElementById("calID").focus();
      document.getElementById("calID").value = e.key;
    }
  }

  return (
    <Layout pageName="Grad Check-In">
      <div className='m-6'>
      {this.state.error && errorBanner}
      {this.state.success && successBanner}
        <h1 className='text-3xl font-medium mb-2'>Grad Pantry Check-In</h1>
        <div className='flex flex-row space-x-16 my-8'>
          <form onSubmit={(e) => this.handleScanSubmit(e)}>
            <fieldset id="calIDFieldset" disabled={false}>
            <div>
            <div className='flex-grow'>Use scanner or manually enter Cal ID (put 1 if general community member)</div>
            <input className="calID border rounded w-2/3 py-2 px-3 text-gray-600 leading-tight"
              placeholder="Cal ID"
              id="calID" autoComplete="off" autoFocus></input>
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


export default function checkinGrad() {
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
      <Layout pageName="Grad Check-In">
        <h1 className='text-xl m-6'>Sorry, you are not authorized to view this page.</h1>
      </Layout>
    )
  }
  else {
    return (<Checkin user={user}></Checkin>)
  }
}
