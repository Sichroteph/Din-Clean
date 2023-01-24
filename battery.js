
// This will hold the battery manager object
var m_Battery;
// Simple var to save if the battery manager is available
var m_b_Battery_Available;
// Store the battery init status
var m_b_Battery_IsInit;
var battery_level=0;
var is_charging = false;

function abs(a){
  if (a>=0)
    return a;
  else 
    return -a;
}

function Battery_GetData()
{   
  // Did we init yet?
  if ((typeof m_b_Battery_IsInit === "undefined") || (m_b_Battery_IsInit === false))
  {
    if (m_b_Debug)
      console.log("[JS:BATT] Battery is not yet initialized!");
    return;
  }

  if (!m_b_Battery_Available)
    return;

  if (m_b_Debug)
    console.log("[JS:BATT] Getting battery data");
  
  
  // Check if it changed a lot then send
  var temp_bat = m_Battery.level * 100;
  var is_charging_temp = m_Battery.charging;
  
  
  if ((abs(battery_level-temp_bat)>=3)||(is_charging_temp!=is_charging)){
    battery_level=temp_bat;
    is_charging=is_charging_temp;
    
    var dictionary = 
        {
          'KEY_PHONE_BAT': m_Battery.level * 100,
          'KEY_PHONE_CHARGE': m_Battery.charging ? 1 : 0,
        
        };

    // Send to Pebble


    Pebble.sendAppMessage(dictionary,
                          function(e)
                          {
                            if (m_b_Debug)
                              console.log("[JS:BATT] Sent message with ID " + e.data.transactionId);
                          },
                          function(e)
                          {
                            if (m_b_Debug)
                              console.log("[JS:BATT] Could not send message with ID " + e.data.transactionId + " Error is: " + e.error);
                          });
  }
}
function Battery_InitSuccess(batteryManager) 
{
  // Assign batteryManager to globally 
  //   available `battery` variable.
  if (m_b_Debug)
    console.log("[JS:BATT] Init OK");

  m_Battery = batteryManager;
  m_b_Battery_Available = true;
  Battery_GetData();
}

function Battery_InitFailure()
{
  if (m_b_Debug)
    console.log("[JS:BATT] Init failed");
}

function Battery_Init()
{
  if (m_b_Debug)
    console.log("[JS:BATT] Init...");

  m_b_Battery_Available = false;


  if("getBattery" in navigator) 
  {
    // Request battery manager object.

    navigator.getBattery().then(function(battery) 
                                {
                                  battery.addEventListener('chargingchange', function(){ updateChargeInfo();});
                                  function updateChargeInfo(){Battery_GetData();}

                                  battery.addEventListener('levelchange', function(){updateLevelInfo();});
                                  function updateLevelInfo(){Battery_GetData();}

                                  battery.addEventListener('chargingtimechange', function(){updateChargingInfo();});
                                  function updateChargingInfo(){Battery_GetData();}

                                  battery.addEventListener('dischargingtimechange', function(){updateDischargingInfo();});
                                  function updateDischargingInfo(){ Battery_GetData();} 
                                });

    navigator.getBattery().then(Battery_InitSuccess, Battery_InitFailure);
  } 
  else 
  {
    // API is not supported, fail gracefully.
    if (m_b_Debug)
      console.log("[JS:BATT] Battery API not supported!");
  }

  m_b_Battery_IsInit = true;

}


