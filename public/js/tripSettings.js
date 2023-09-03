function deleteTrip(tripId){
    // deletes selected trip by calling API endpoint

    if (confirm("Are you sure you want to remove this trip?")) {
        $.ajax({
            url: `/trips/${tripId}`,
            method: "DELETE",
            xhrFields: {
              withCredentials: true
           },
            success : function () {
              // reload trips page on status 200
              window.location.href = "/trips";
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
            }
          });
    }
  };