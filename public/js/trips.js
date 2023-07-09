function filterTrips(item) {
    // function updates the button of dropdown menu with chosen option
    document.getElementById("tripTypeDropdownButton").innerHTML = item.innerHTML;

    if(item.innerHTML === "Upcoming trips"){
      let elementsToDisplay = document.getElementsByName("upcoming");
      for (let element of elementsToDisplay){
        $(element).show();
      }

      let elementsToHide = document.getElementsByName("archived");
      for (let element of elementsToHide){
        $(element).hide();
      }
    } else if (item.innerHTML === "Past trips"){
      let elementsToDisplay = document.getElementsByName("archived");
      for (let element of elementsToDisplay){
        $(element).show();
      }

      let elementsToHide = document.getElementsByName("upcoming");
      for (let element of elementsToHide){
        $(element).hide();
      }
    } else if(item.innerHTML === "All"){
      let elementsToDisplay = document.getElementsByClassName("trip");
      for (let element of elementsToDisplay){
        $(element).show();
      }
    }
 
};

function showModal(item){
  /* 
  Detect what action the user wants to do and pop up relative modal. 
  User can either want to delete a trip or share its details.
  */
  let indexFirstUnderscore = item.name.indexOf("_");
  let action = item.name.slice(0, indexFirstUnderscore);
  let tripId = item.name.slice(indexFirstUnderscore + 1);
  let tripTitle = document.getElementById(`trip-title-${tripId}`).innerHTML;

  let tripModal = document.getElementById("trips-modal");
  let modalMessage = document.getElementById("trips-modal-message");
  let modalTitle = document.getElementById("trips-modal-title");
  let closeButton = document.getElementById("close-button");
  let deleteButton = document.getElementById("delete-button");
  let cancelButton = document.getElementById("cancel-button");

  if(action === "delete"){
    modalMessage.innerHTML = `Are you sure you want to delete your trip called '${tripTitle}'?`;
    modalTitle.innerHTML = "Confirm trip deletion";
    deleteButton.setAttribute("name", tripId);

    $(closeButton).hide();
    $(deleteButton).show();
    $(cancelButton).show();
  }

  if(action === "share"){
    modalMessage.innerHTML = `Share this link to invite your friends to join this trip.`;
    modalTitle.innerHTML = `Share trip '${tripTitle}'`;

    $(closeButton).show();
    $(deleteButton).hide();
    $(cancelButton).hide();
  }
  
  let modal = new bootstrap.Modal(tripModal, {});
  modal.show();

};

function deleteTrip(item){
  let tripId = item.name;
  $.ajax({
    url: `/trips/${tripId}`,
    method: "DELETE",
    xhrFields: {
      withCredentials: true
   },
    success : function () {
      // reload trips page
      window.location.href = "/trips";
    }
  });
};

function redirectTripView(element, tripId){
  window.location.href = `/trips/${tripId}`;
}