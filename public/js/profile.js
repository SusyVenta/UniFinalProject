function alterEditUsername(){
    // if the input field is disabled, enables it and changes icon to save
    // when user clicks on save, disable input and change icon to edit
    let inputElement = document.getElementById("username-input");
    if (inputElement.disabled) {
        $(inputElement).removeAttr('disabled');

        let icon = document.getElementById("edit-username-button-icon");
        icon.className = "fas fa-save";
    } else {
        // save action triggered
        inputElement.disabled = true;

        let icon = document.getElementById("edit-username-button-icon");
        icon.className = "fas fa-pencil";

        let uid = (window.location.href).split("/").at(-1);

        let payload = {username: inputElement.value};
        // save modifications
        $.ajax({
            url: `/profile/${uid}`,
            method: "POST",
            xhrFields: {
              withCredentials: true
            },
            data: jQuery.param(payload),
            success : function () {
              alert("New username saved");
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) { 
                alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
            }
        });
    }
}

function openEditPictureModal(){
    // open modal that allows to upload new profile picture
    let modal = new bootstrap.Modal(document.getElementById("edit-picture-modal"), {});
    modal.show();

}

function initializeCroppie(input) {
    // shows uploaded image and allows to resize it
    // https://codepen.io/rsales/pen/XyWORN
    if (input.files && input.files[0]) {
      let reader = new FileReader();
      reader.onload = function(e) {
        $('#uploaded-image').attr('src', e.target.result);
        let resize = new Croppie($('#uploaded-image')[0], {
          viewport: { 
            width: 200, 
            height: 200,
            type: 'circle'
          },
          boundary: { 
            width: 300, 
            height: 300 
          },
          // showZoomer: false,
          // enableResize: true,
          enableOrientation: true
        });

        // save image when user clicks on Save button
        $('#save-picture-button').fadeIn();
        $('#save-picture-button').on('click', function() {
            // close modal
            let modal = new bootstrap.Modal(document.getElementById("edit-picture-modal"), {});
            modal.hide();

            resize.result('base64').then(function(dataImg) {
                console.log(dataImg);
                // send data to backend via ajax
                let uid = (window.location.href).split("/").at(-1);

                let payload = {picturePath: dataImg};
                // save modifications
                $.ajax({
                    url: `/profile/${uid}`,
                    method: "POST",
                    xhrFields: {
                    withCredentials: true
                    },
                    data: jQuery.param(payload),
                    success : function () {
                      let uid = document.getElementById("current-user-uid").innerHTML.trim();
                      window.location.href = "/profile/" + uid;
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) { 
                        alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
                    }
                });
            })
        })
      }
      reader.readAsDataURL(input.files[0]);
    }
  }

  function searchFriend(){
    let searchString = document.getElementById("search-friend-input").value;
    
    // change form action
    document.getElementById("search-bar-container").action = "/friends/search/" + searchString;

    // submit form
    document.getElementById("search-bar-container").submit();

  }

  function removeFriend(friendID){
    $.ajax({
      url: `/friends/${friendID}`,
      method: "DELETE",
      xhrFields: {
        withCredentials: true
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) { 
        alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
      },
      success : function () {
        window.location.href = "/friends";
      }
    });
  }

  function deleteProfile(userID){
    if (confirm("Are you sure you want to completely delete your profile?")) {
      $.ajax({
        url: `/profile/${userID}`,
        method: "DELETE",
        xhrFields: {
          withCredentials: true
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
          alert(XMLHttpRequest.responseText, textStatus, errorThrown); 
        },
        success : function () {
          window.location.href = "/auth/signup";
        }
      });
    }
  }
