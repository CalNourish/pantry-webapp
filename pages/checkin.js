import Layout from '../components/Layout'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import cookie from 'js-cookie';
import React from 'react';

import { useUser } from '../context/userContext'
import { server } from './_app.js'
import { render } from 'react-dom';

const fetcher = (url) => fetch(url).then((res) => res.json())

var token = cookie.get("firebaseToken")

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

  showLastVisitInfo = () => {
    var messageToReturn = ""
    if (this.state.lastScannedID == "N/A") {
      return <div className='flex-grow'>{messageToReturn}</div>;
    }
    else {
      var numVisits = this.state.visitsLastWeek.length
      if (numVisits== 0) {
        messageToReturn= "This visitor has not visited the pantry this week."
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
    }
    return <div className='flex-grow text-left bg-amber-400'>{messageToReturn}</div>;
  };
   
  handleScanSubmit = async (e) => {
    var fieldset = document.getElementById("calIDFieldset")
    fieldset.disabled = true
    e.preventDefault();
    if (e.target.calID.value.length == 0 || e.target.calID.value == null) {
      this.showError("Can't submit blank ID: " + e.target.calID.value,1000)
      return
    }
    token = await this.state.user.googleUser.getIdToken()
    fetch('/api/admin/CheckIn', { method: 'POST',
      body: JSON.stringify({calID: e.target.calID.value, isGrad:false}),
      headers: {'Content-Type': "application/json", 'Authorization': token}
    })
    .then((result) => {
      result.json()
      .then((lastVisitedTimes) => {
        if (lastVisitedTimes.error) {
          this.showError(lastVisitedTimes.error)
        }
        else {
          this.setState({lastScannedID:e.target.calID.value, visitsLastWeek:lastVisitedTimes, lastScannedTime:new Date().toLocaleTimeString()})
          this.showSuccess("Sucessfully scanned ID: " + e.target.calID.value,1000)
          e.target.calID.value = null;
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
    <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className='m-6'>
        {this.state.error && errorBanner}
        {this.state.success && successBanner}
          <h1 className='text-3xl font-medium mb-2'>Pantry Check-In</h1>
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
    </>
  )
  }
}


export default function checkin() {
  /* Display loading message */
  const { user } = useUser();
  let authToken = (user && user.authorized === "true") ? token : null;
  if (!authToken) {
    return (
    <>
      <Head>
        <title>Pantry</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
          <h1 className='text-xl m-6'>Sorry, you are not authorized to view this page.</h1>
      </Layout>
    </>
    )
  }
  else {
    return (<Checkin user={user}></Checkin>)
  }
}
