
function alterTripTitle(tripID){
  // if the title is an h1 element, removes it, creates an input element, and changes icon to save
  // when user clicks on save, remove input element, display h1 element, and change icon to edit
  let titleElement = document.getElementById("title");
  let titleElementType = titleElement.tagName;

  let title;
  if(titleElementType == "H1"){
    title = titleElement.innerHTML;
  } else if (titleElementType == "INPUT"){
    title = titleElement.value;
  }

  // remove h1
  titleElement.remove();

  let parent = document.getElementById("title-inner-container");
  let icon = document.getElementById("edit-trip-title-button-icon");

  if(titleElementType == "H1"){
    /* create input element: 
    
    <input 
      autocomplete="one-time-code" 
      class="form-control" id="title" 
      required=true 
      value="<%= trip.tripTitle %>"
      >
    */
    let inputElement = document.createElement("input");
    inputElement.setAttribute("id", `title`);
    inputElement.setAttribute("autocomplete", "one-time-code");
    inputElement.setAttribute("class", `form-control`);
    inputElement.setAttribute("required", 'true');
    inputElement.setAttribute("value", title);
    
    parent.prepend(inputElement); // insert as first child

    // change icon to save
    icon.className = "fas fa-save";

  } else if (titleElementType == "INPUT"){
    // create h1 element: <h1 id="title"><title></h1>
    let h1 = document.createElement("h1");
    h1.setAttribute("id", `title`);
    h1.innerHTML = title;

    parent.prepend(h1); // insert as first child

    icon.className = "fas fa-pencil";

    let payload = { 
      tripTitle: title,
      tripID: tripID
    };
  
    $.ajax({
      url: `/trips/` + tripID + "/participants",
      method: "POST",
      xhrFields: {
        withCredentials: true
      },
      data: jQuery.param(payload),
      success: function() {   
        // if successful call, reload page
        location.reload();  
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) { 
        alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
      }
    }); 
  }

}