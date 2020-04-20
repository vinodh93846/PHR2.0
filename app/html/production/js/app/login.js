'use strict';

//let _otp = '';

function initPage() {
}

function tryLogin() {
    let id = document.getElementById('userName').value; // eventhough variable is id , its actually userName , which will be handled in the backend
    let otp = document.getElementById('otp').value;
    let type_of_user = document.getElementById('type_of_user').value

    if(!userName) {
      alert('Please provide a valid ID');
      return;
    }
    if(otp == '' /* || otp !== _otp*/) {
      alert('Please provide a valid OTP');
      return;
    }
    let token = '';
    let options = { 'id': id, 'otp': otp, 'type_of_user':type_of_user };
    $.when($.post('/composer/client/login', options)).done(function (_res) {
    
      if(_res.result == 'success') {
          token = _res.token;
          new PNotify({
              title: 'Success',
              text: 'A token is generated. </br> </br> Token is valid only for 5 minutes.',
              type: 'success',
              hide: true, 
              styling: 'bootstrap3'
          });
      } else {
          new PNotify({
              title: 'Failed',
              text: _res.error,
              type: 'error',
              hide: true,
              styling: 'bootstrap3'
          });
      }
      closeProgress();
      if (typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        sessionStorage.token = token;
      } else {
        // Sorry! No Web Storage support..
        console.log("No Storage support");
      }
      window.location = _res.url;    
  });
  }


  function tryLoginv() {
    let id = document.getElementById('id').value;
    let otp = document.getElementById('otp').value;
    if(!id) {
      alert('Please provide a valid ID');
      return;
    }
    if(otp == '' || otp !== _otp) {
      alert('Please provide a valid OTP');
      return;
    }
    let options = {
      'id': id,
      'otp': otp
    };
      $.when($.get('/composer/client/login', options)).done(function (_res) {
      
        if(_res.result == 'success') {
            token = _res.token;
            new PNotify({
                title: 'Success',
                text: 'A token is generated. </br> </br> Token is valid only for 5 minutes.',
                type: 'success',
                hide: true, 
                styling: 'bootstrap3'
            });
        } else {
            new PNotify({
                title: 'Failed',
                text: _res.error,
                type: 'error',
                hide: true,
                styling: 'bootstrap3'
            });
        }
        closeProgress();
        if (typeof(Storage) !== "undefined") {
          // Code for localStorage/sessionStorage.
          sessionStorage.setItem("token", token);
        } else {
          // Sorry! No Web Storage support..
          console.log("No Storage support");
        }
        window.location = url;       
    });
  }


  function generateOTP() {

    let userName = document.getElementById('userName').value;
    let type_of_user = document.getElementById('type_of_user').value;

    if(!userName) {
        alert('Please provide a valid User Name !!');
        return;
      }
  
    startProgress();

    setTimeout(function() {

        let options = {
            'userName': userName,
            'type_of_user': type_of_user
        };

        $.when($.get('/composer/client/generateOTP', options)).done(function (_res) {
    
            if(_res.result == 'success') {
                //_otp = _res.otp;
                new PNotify({
                    title: 'Success',
                    text: 'An OTP has been sent to the registerd email ID. Please use the OTP for login. </br> </br> OTP is valid only for 5 minutes.',
                    type: 'success',
                    hide: true, 
                    styling: 'bootstrap3'
                });
            } else {
                new PNotify({
                    title: 'Failed',
                    text: _res.error,
                    type: 'error',
                    hide: true,
                    styling: 'bootstrap3'
                });
            }
            closeProgress();        
        });        
    }, 3000);

}
