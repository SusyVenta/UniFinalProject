function showAddFriendsModal(){
  /* 
  When user clicks on 'Add friend' button, opens the modal to carry out this action.
  Inside the modal, initialize multiselect searchable dropdown menu
  */
  let tripModal = document.getElementById("add-friend-modal");
  let modal = new bootstrap.Modal(tripModal, {});
  modal.show();

  // render searchable select used to add friends to trip
  // https://stackoverflow.com/questions/69530889/adding-bootstrap-5-search-bar-dropdown
  // https://tom-select.js.org/plugins/remove-button/
  new TomSelect("#multiselect-friends", {
    plugins: ['remove_button'],
    create: true,
    onItemAdd: function() {
      this.setTextboxValue('');
      this.refreshOptions();
    },
    render: {
      item: function(data, escape) {
        return '<div>' + escape(data.text) + '</div>';
      }
    }
  });

};

function addFriendsToTrip(){
  /* Calls API endpoint to add friends to trip */
  let select = document.getElementById('multiselect-friends');
  let control = select.tomselect;
  let selectedItems = control.items;
  let askAllParticipantsDates = document.getElementById("askAllParticipantsDates").value;
  let tripID = (window.location.href).split("/").at(-1);

  if( selectedItems.length > 0){
    let payload = { 
      friendsToAdd: selectedItems,
      tripID: tripID,
      askAllParticipantsDates: askAllParticipantsDates
    };

    $.ajax({
      url: `/trips/` + tripID,
      method: "POST",
      xhrFields: {
        withCredentials: true
      },
      data: jQuery.param(payload),
      success: function() {   
        // if successful call, reload page
        location.reload();  
      }
    });
  }

  // reload page
  //window.location.href = "/trips/" + tripID;
};

function removeFriendFromTrip(tripID, friendUID){
  let payload = { 
    friendToRemove: friendUID,
    tripID: tripID
  };

  $.ajax({
    url: `/trips/` + tripID,
    method: "POST",
    xhrFields: {
      withCredentials: true
    },
    data: jQuery.param(payload),
    success: function() {   
      // if successful call, reload page
      location.reload();  
    }
  });
};
/* edit user preferences ----------------------------------------------------------------------*/

function deleteDateAvailability(element){
  // deletes div with date availability
  let elementToDelete = document.getElementById(`date-availability-${element.name}`);
  elementToDelete.remove();
}


function addDateAvailabilityInput(){
  /* 
  creates new date-range picker div every time the "add" button is clicked:

  <div id="date-availability-1" class="date-availability-container">
    <div class="horizontal-flex">
      <div class="label-and-input-container">
        <label for="new-trip-availability-1" class="form-label">When are you available?</label>
        <div class="form-control" >
          <i class="fa fa-calendar"></i>
          <input class="form-control" id="new-trip-availability-1" type="text" name="daterange" value="start date - end date" />
        </div>
      </div>
      <div class="date-availability-delete-button-container">
        <button id="delete_date-availability-1" class="btn btn-secondary" onclick="deleteDateAvailability(this);">
          <span class="material-symbols-outlined modified">delete</span>
        </button>
      </div>
    </div>
  </div>
  */
  let dateAvailabilitiesContainer = document.getElementById("date-availabilities-container");
  let dateAvailabilityIDs = document.querySelectorAll('[id^="date-availability-"]');
  let numberExistingDatePickers = 0;
  for (let dateAvailabilityID of dateAvailabilityIDs){
    if(parseInt(dateAvailabilityID) > numberExistingDatePickers){
      numberExistingDatePickers = parseInt(dateAvailabilityID)
    }
  }
  let newId = numberExistingDatePickers + 1;

  // form control ------------------------------------
  let formControlDiv = document.createElement("div");
  formControlDiv.setAttribute("class", `form-control`);

  let icon = document.createElement("i");
  icon.setAttribute("class", `fa fa-calendar`);

  let input = document.createElement("input");
  input.setAttribute("class", `form-control`);
  input.setAttribute("id", `new-trip-availability-${newId}`);
  input.setAttribute("type", `text`);
  input.setAttribute("name", `daterange`);
  input.setAttribute("value", `start date - end date`);

  formControlDiv.appendChild(icon);
  formControlDiv.appendChild(input);

  // label ------------------------------------------
  let label = document.createElement("label");
  label.setAttribute("for", `new-trip-availability-${newId}`);
  label.setAttribute("class", `form-label`);
  label.innerHTML = "When are you available?";

  // label-and-input-container -----------------------
  let labelAndInputContainerDiv = document.createElement("div");
  labelAndInputContainerDiv.setAttribute("class", `label-and-input-container`);
  labelAndInputContainerDiv.appendChild(label);
  labelAndInputContainerDiv.appendChild(formControlDiv);

  // date-availability-delete-button-container -------
  let span = document.createElement("span");
  span.setAttribute("class", `material-symbols-outlined modified`);
  span.innerHTML = "delete";

  let spanButton = document.createElement("button");
  spanButton.setAttribute("id", `delete_date-availability-${newId}`);
  spanButton.setAttribute("name", newId);
  spanButton.setAttribute("class", `btn btn-secondary`);
  spanButton.setAttribute("onclick", `deleteDateAvailability(this);`);
  spanButton.appendChild(span);

  let spanButtonContainerDiv = document.createElement("div");
  spanButtonContainerDiv.setAttribute("class", `date-availability-delete-button-container`);
  spanButtonContainerDiv.appendChild(spanButton);

  // horizontal flex div -----------------------------
  let horizontalFlexDiv = document.createElement("div");
  horizontalFlexDiv.setAttribute("class", `horizontal-flex`);
  horizontalFlexDiv.appendChild(labelAndInputContainerDiv);
  horizontalFlexDiv.appendChild(spanButtonContainerDiv);

  // date availability external div ------------------
  let dateAvailabilityDiv = document.createElement("div");
  dateAvailabilityDiv.setAttribute("id", `date-availability-${newId}`);
  dateAvailabilityDiv.setAttribute("class", `date-availability-container`);

  dateAvailabilityDiv.appendChild(horizontalFlexDiv);

  dateAvailabilitiesContainer.appendChild(dateAvailabilityDiv);

  // associate date picker to input created above
  $(function() {
    $(`#new-trip-availability-${newId}`).daterangepicker({
      opens: 'left',
      minYear: moment().year(),
      startDate: moment().date(),
      endDate: moment().date()
    });
  });

  // add event listener to change value of the changed date picker input element
  $(`#new-trip-availability-${newId}`).on('apply.daterangepicker', function(event, picker) {
    let newValue = picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY');
    document.getElementById(event.target.id).value = newValue;
  });
};

function getSelectedDates(){
  // returns availability dates selected by user as an array
  let dateAvailabilities = document.querySelectorAll('[id^="new-trip-availability-"]');
  
  let selectedDates = [];
  for(let date of dateAvailabilities){
    selectedDates.push(date.value);
  }
  return selectedDates;
};

function saveUserAvailabilities(tripID){
  // collects data from modal and submits it to the API endpoint
  let nullChecks = {
    workingDays: {
      value: document.getElementById("working-days-availability").value,
      message: "Please enter a number of working days you are available"
    },
    totalDays: {
      value: document.getElementById("total-days-availability").value,
      message: "Please enter a number of total days you are available"
    }
  }

  for (const [fieldName, value_message] of Object.entries(nullChecks)) {
    if (value_message.value == ""){
      alert(value_message.message);
      return;
    }
  }  

  let payload = { 
    datesPreferences: getSelectedDates(),
    workingDaysAvailability: nullChecks.workingDays.value,
    totalDaysAvailability: nullChecks.totalDays.value,
    tripID: tripID
  };

  console.log(payload);
  console.log(tripID);

  $.ajax({
    url: `/trips/` + tripID,
    method: "POST",
    xhrFields: {
      withCredentials: true
    },
    data: jQuery.param(payload),
    success: function() {   
      // if successful call, reload page
      location.reload();  
    }
  }); 
  
};