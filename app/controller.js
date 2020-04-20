/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict';

var path = require('path');
//var Fabric_Client = require('fabric-client');
var os = require('os');
var fs = require('fs');
//var crypto = require('crypto');
var util = require('util');
const jwt = require('jsonwebtoken');
//var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;


const nodemailer = require('nodemailer');
//const CHANNEL_NAME = 'chips-phr-doctor-patient';
//const CHAINCODE_ID = 'chips-phr-app';


//  const CHANNEL_NAME = 'mychannel';
//  const CHAINCODE_ID = 'fabcar';


const KEY = fs.readFileSync('./key.txt'); //crypto.randomBytes(32) should be 128 (or 256) bits
const IV = fs.readFileSync('./iv.txt');//crypto.randomBytes(16) Initialization Vector is always 16-bytes





/*
** For Fabric 2.0 
*/

const { Gateway, Wallets } = require('fabric-network');
//  const { DiscoveryHandler } = require('fabric-common');


var auth = [];
var accessOTP_auth = [];

exports.login = async function(req, res, _next) {


    var id = req.body.id; // not id but username
    var otp = req.body.otp;
    var type_of_user = req.body.type_of_user;

    console.log("controller id value:"+id);
    console.log("controller otp value:"+otp);

    var orgToken = jwt.sign(
        {
            _id: id,
            _otp: otp
        },
        'jwt_Secret_Key_for_CHiPS_PHR_Of_32Bit_String',
        {
            expiresIn: '1800000'
        }
    );
    let url='';
    let x;

    let loopVar;
    
    for(loopVar=0;loopVar<auth.length;++loopVar){
        
        if(auth[loopVar][1] == id && auth[loopVar][0] == type_of_user && auth[loopVar][2] == otp ){
                        
            if(type_of_user == "Admin" && id == "Admin" ) {
                url = 'phr_admin_dash.html';
                res.send({'result': 'success',
                    'url': url,
                    'x':x,
                    'token': orgToken});
        
            }else if (type_of_user == "Doctor") {
                queryValues("GetDoctors",[],'doctor_list',res,(doctors)=>{
                    //console.log("\n\nDoctors : ",doctors)
                    let i;
                    for(i=0;i<doctors.length;++i){
                        let checkName = doctors[i].Record.contact_details.first_name+" "+doctors[i].Record.contact_details.last_name;
                        if(id == checkName){

                            console.log("Doctor found !! ");
                            id = doctors[i].Record.id;
                            url = 'phr_doctor.html?doctor_id='+id;
                            res.send({'result': 'success',
                                'url': url,
                                'x':x,
                                'token': orgToken});
                            break;
        
                        }
                    }
                })
                
            }else if (type_of_user == "Patient") {
                
                queryValues("GetPatients", [], 'patient_list', res,(patients)=>{
                    //console.log("\n\n\n\nPatients : ",patients)
                    let i;
                for(i=0;i<patients.length;++i){
                    let checkName = patients[i].Record.contact_details.first_name+" "+patients[i].Record.contact_details.last_name
                    if(id == checkName){
                        console.log("Patient Found !! ")
                        id = patients[i].Record.id;
                        url = 'phr_patient.html?patient_id='+id;
                        res.send({'result': 'success',
                    'url': url,
                    'x':x,
                    'token': orgToken});
        
                    break;
            
                        
                    }
                    
                }
                })
                    
                    
                
                
                            
            }else{
                
                url ='login.html' 
                res.send({'result': 'failed',
                    'url': url,
                    'error':"Invalid Credentials !!! "
                    });
        
        
            }
        auth.splice(loopVar,1);

       
        
        }
        if(( auth.length-1) == loopVar ){
                
            url ='login.html' 
            res.send({'result': 'failed',
                'url': url,
                'error':"Invalid Credentials !!! "
                });
            
        }
        

    }

}

exports.addDoctor = function (req, res, _next) {
    
    duplicate_email_detection(req,res,cb=>{
        
        var first_name = req.body.first_name;
        var last_name = req.body.last_name;
        var email = req.body.email;
        var address = req.body.address;
        var state = req.body.state;
        var city = req.body.city;
        var license_no = req.body.license_no;
        var status = req.body.status;
        var args = [first_name, last_name, email, address,
                    state, city, license_no, status];
        
        invoke("AddDoctor", args, res);

    })
    
    
};

exports.changeStatus = function (req, res, _next) {

    var id = req.body.id;
    var status = req.body.status;
    var args = [id, status];
    invoke("ChangeStatus", args, res);
};

exports.addPatient = function (req, res, _next) {

    console.log("Request URL : ",req.url)
    
    duplicate_email_detection(req,res,cb=>{
        
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var address = req.body.address;
    var state = req.body.state;
    var city = req.body.city;
    var birth_year = req.body.birth_year;
    var gender = req.body.gender;
    var args = [first_name, last_name, email, address,
                state, city, birth_year, gender]
    
    invoke("AddPatient", args, res) ;

})
};

exports.addPrescription = function (req, res, _next) {
    
    var doctorName = req.body.doctorName;
    var doctorID = req.body.doctorID;
    var prescriptionData = req.body.prescriptionData;
    var patientName = req.body.patientName;
    var patientID = req.body.patientID;
    var drugs = req.body.drugs;
    var refillCount = req.body.refillCount;
    var voidAfter = req.body.voidAfter;
    var args = [doctorName, doctorID, prescriptionData, patientName,
                patientID, drugs, refillCount, voidAfter];
    
    invoke("AddPrescription", args, res);
};

exports.addReport = function (req, res, _next) {

    var refDoctor   = req.body.refDoctor;
    var codeID      = req.body.codeID;
    var reportType  = req.body.reportType;
    var reportName  = req.body.reportName;
    var patientID   = req.body.patientID;
    var patientName = req.body.patientName;
    var reportData  = req.body.reportData;
    var date        = req.body.date;
    var submitType  = req.body.submitType;
    var args = [refDoctor, codeID, reportType, reportName, patientName, patientID,
                reportData, submitType, date];

    invoke("AddReport", args, res);
};
exports.getDoctors = function (_req, res, next) {

    query("GetDoctors", [], 'doctor_list', res);

};

exports.getPatients = function (_req, res, _next) {

    query("GetPatients", [], 'patient_list', res);
}


exports.getPatientInfo = function (req, res, next) {

    var patient_id = req.query.patient_id;
    query("GetPatientInfo", [patient_id], 'patient_list', res)

}

exports.getDoctorInfo = function (req, res, next) {

    var doctor_id = req.query.doctor_id;
    
    query("GetDoctorInfo", [doctor_id], 'doctor_list', res)

}

exports.getPrescriptionById = function (req, res, next) {

    var patient_id = req.query.patient_id;
    query("GetPrescriptionById", [patient_id], 'prescription_list', res)

}

exports.getReportById = function (req, res, next) {

    var patient_id = req.query.patient_id;
    query("GetReportById", [patient_id], 'report_list', res)

}

exports.getDoctorCount = function (_req, res, _next) {

    queryCount("GetDoctors", res);
}

exports.getPatientCount = function (req, res, next) {

    queryCount("GetPatients", res);

}

exports.getPrescriptionCount = function (req, res, next) {

    queryCount("GetPrescriptions", res);

}

exports.getReportCount = function (req, res, next) {

    queryCount("GetReports", res);

}

exports.shareRecords = function (req, res, next) {

    
    var patient_id = req.body.patient_id;
    var patient_name = req.body.patient_name;
    var email = req.body.email;
    
    var subject = 'Medical Record shared for review';
    var message = '<b>' + patient_name + '</b> has shared medical records with you for review. <br/><br/>' + 
                  'To access the records please use the URL: <br/> <a href='+'localhost:6001/production/login.html'+'>localhost:6001/production/login.html</a> <br/><br/>' +
                  'Patient ID: ' + patient_id;
    console.log("\nSending Mail : Recipient : ",email);
    sendEmail(email, subject, message,res,(result)=>{
        if(result == 'success'){
            console.log("\nMail Sent Successfully .... Sending Response .....\n ");
            res.send({ 'result': 'success' });
        }else{
            console.log("Error Sending Mail !!");
            res,send({ 'result' : 'failed'});nSending
        }    
    })
    

}


// function _monitor(_event) {
//     var method = '_monitor';
//     console.log(method + ' _event received: ' + _event.event_name);

//     if (_event.event_name == 'DoctorAddedEvent') {
//         sendEmailTo(_event);
//     }

//     if (_event.event_name == 'PatientAddedEvent') {
//         sendEmailTo(_event);
//     }
// }

// function sendEmailTo(event) {

//     let event_payload = JSON.parse(event.payload.toString());
//     var to = event_payload.email;
//     var subject = 'EHR Blockchain - Registration ';
//     var url = '';
//     switch (event.event_name) {
//         case 'DoctorAddedEvent':
//             url = 'http://localhost:6001/production/phr_doctor.html';
//             break;

//         case 'PatientAddedEvent':
//             url = 'http://localhost:6001/production/phr_patient.html';
//             break;
//     }

//     var message = 'Dear <b>' + event_payload.firstName + ' ' + event_payload.lastName + '</b>, Congrats!!! You are now successfully registered to the <b>EHR Blockchain System</b>.' +
//         '<br/><br/>' +
//         'To login to the system, Please login to the following URL: ' +
//         '<br/>' +
//         '<br/>' +
//         url +
//         '<br/>' +
//         '<br/>' +
//         'Your USER-ID : <b>' + event_payload.id + '</b>'+
//         '<br/>' +
//         '<br/>' +
//         'User Name for Login : <b> '+ event_payload.firstName + ' ' + event_payload.lastName+'</b>';

//     sendEmail(to, subject, message);
// }


async function sendEmail(email, subject, message,res,callback) {

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'tech.ibhaan', // generated ethereal user
            pass: 'Ibhaan@123' // generated ethereal password
        }
       
    });

    // setup email data with unicode symbols
    var mailOptions = {
        from: 'tech.ibhaan@gmail.com', // sender address
        to: email,
        subject: subject, // Subject line
        html: message  // html body
    };
    // send mail with defined transport object
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("sendEmail:- ",error);
            return callback('failed');
            
        }else{
            console.log("\n\nAccepted Mail Id : ",info.accepted);
            return callback('success');
        }
              
    });
}

exports.getHistory = function(req, res, next) {

    // query("getHistory", [CHANNEL_NAME], 'history', res)
    query("GetHistory", [req.query.history_id], 'history', res)

}

exports.generateOTP = async function (req, res, next) {
    
    if(req.query.userName) {

        var userName = req.query.userName;
        var type_of_user = req.query.type_of_user;
        if(type_of_user=="Admin" && userName=="Admin" ){
        
            var otp = Date.now().toString().substr(-6);
            var subject = 'CHiPS EHR: Login OTP';
            var message = 'Your CHiPS EHR OTP is: ' + otp;
    
            console.log('\n\nOTP :  ' + otp);
    
            let x;
            if(auth.length==0){
                auth.push([ type_of_user , userName , otp ] ) 
            }else{
                for(x=0;x<auth.length;++x){
                    if(auth[x][0] == type_of_user && auth[x][1] == userName ){
                        auth[x] = new Array(type_of_user,userName,otp)
                        break;
                    }
                    if(x==(auth.length-1)){
                        auth.push([ type_of_user , userName , otp ] ) 
                    }
                                    
                }
            }
            
           console.log("\nSending OTP via mail .... ");
           sendEmail("tech.ibhaan@gmail.com", subject, message,res,(result)=>{   // hard coded admin mail id  
               if(result == 'success'){
                    console.log("\nMail Sent Successfully ... Sending The OTP And Response\n")
                    res.send({
                        'result': 'success',
                        'otp': otp
                    });
               }else{
                    console.log("Mailing Failed !!");
                    res.send({
                        'result': 'failed',
                        'error': "Mailing Failed !!"
                    });
               }
           });  
            
            
    
        }else if(type_of_user=="Doctor"){
            
            queryValues("GetDoctors",[],'doctor_list',res,(doctors)=>{
                
                let i;
                for(i=0;i<doctors.length;++i){
                    let checkName = doctors[i].Record.contact_details.first_name+" "+doctors[i].Record.contact_details.last_name;
                    if(userName == checkName){
                        
                        console.log("Doctor found !! \n");
                        console.log("Doc : ",doctors[i].Record)
                        if(doctors[i].Record.status=='Active'){
                        
                            var email =  doctors[i].Record.contact_details.email
                            var otp = Date.now().toString().substr(-6);
                            var subject = 'CHiPS EHR: Login OTP';
                            var message = 'Your CHiPS EHR OTP is: ' + otp;
        
                            console.log('\n\nOTP :  ' + otp);
                            
                            let x;
                            if(auth.length==0){
                                auth.push([ type_of_user , userName , otp ] ) 
                            }else{
                                for(x=0;x<auth.length;++x){
                                    if(auth[x][0] == type_of_user && auth[x][1] == userName ){
                                        auth[x] = new Array(type_of_user,userName,otp)
                                        break;
                                    }
                                    if(x==(auth.length-1)){
                                        auth.push([ type_of_user , userName , otp ] ) 
                                    }
                                                    
                                }
                            }
                                                        
                          sendEmail(email, subject, message,res,(result)=>{
                              if(result == 'success'){

                                console.log("\nSuccessfully Mailed OTP ... Sending The Response .... \n")  
                                res.send({
                                    'result': 'success',
                                    'otp': otp
                                });

                              }else{
                                
                                console.log("Mailing OTP Failed ... Sending Operation Failed Response ....");
                                res.send({
                                    'result': 'failed',
                                    'error': "Mailing Failed !!"                                   
                                });

                              }
                          });        
                            
                            break; 

                        }else{
                            console.log("Access Suspended for this Doctor !! \nSending UnAuthorised Response ..... ")
                            res.send({
                                'result': 'failed',
                                'error': "UnAuthorised !!" 
                            });
                            break;
                        }             
                }
                    if(i == (doctors.length-1)){
                        console.log("Invalid Username !! ")
                        res.send({
                            'result': 'failed',
                            'error': "Invalid Username !!" 
                        });
                    }
                }
            })
    
        }else if(type_of_user=="Patient"){
            
            queryValues("GetPatients", [], 'patient_list', res,(patients)=>{
                let i; 
            for(i=0;i<patients.length;++i){
                let checkName = patients[i].Record.contact_details.first_name+" "+patients[i].Record.contact_details.last_name
                
                if(userName == checkName){
                    console.log("Patient found !! \n");
                        var email =  patients[i].Record.contact_details.email
                        var otp = Date.now().toString().substr(-6);
                        var subject = 'CHiPS EHR: Login OTP';
                        var message = 'Your CHiPS EHR OTP is: ' + otp;
    
                        console.log('\n\nOTP :  ' + otp);
                        
                        let x;
                        if(auth.length==0){
                            auth.push([ type_of_user , userName , otp ] ) 
                        }else{
                            for(x=0;x<auth.length;++x){
                                if(auth[x][0] == type_of_user && auth[x][1] == userName ){
                                    auth[x] = new Array(type_of_user,userName,otp)
                                    break;
                                }
                                if(x==(auth.length-1)){
                                    auth.push([ type_of_user , userName , otp ] ) 
                                }
                                                
                            }
                        }

                      sendEmail(email, subject, message,res,(result)=>{
                          if(result == 'success'){
                            console.log("\nSuccessfully Mailed OTP ... Sending The Response .... \n")  
                            res.send({
                                'result': 'success',
                                'otp': otp
                            });
                          }else{
                            console.log("Mailing OTP Failed ... Sending Operation Failed Response ....");
                            res.send({
                                'result': 'failed',
                                'error': "Mailing Failed !!" 
                            });
                          }
                      });        
                        
        
                    break;
                }

                if(i == (patients.length-1)){
                    console.log("Invalid Username !! ")
                    res.send({
                        'result': 'failed',
                        'error': "Invalid Username !!" 
                    });
                }
                
            }
            })
                
    
        }else{
            res.send({
                'result': 'failed',
                'error': "Invalid Username !!" 
            });
    
        }

    }else if(req.query.email){       
        
        var otp = Date.now().toString().substr(-6);
        var subject = 'CHiPS EHR: Login OTP';
        var message = 'Your CHiPS EHR OTP is: ' + otp;

        console.log('\n\nOTP :  ' + otp);

        console.log("Sending Mail .... ");
        sendEmail(req.query.email, subject, message,res,(result)=>{
            if(result=='success'){
                console.log("\n\nMail sent Successfully !! .... Sending the Response .... \n\n")
                requestArray.push([req.query.patient_id,req.query.doctor_id,(new Date()).toString()])
                accessOTP_auth.push([req.query.email,req.query.doctor_id,req.query.patient_id,otp,(Date.now()).toString()])
                res.send({
                    'result': 'success'
                });
        
            }else{
                console.log("\n\nMailing Failed !! .... Sending the Error Response .... \n\n")
                res.send({
                    'result': 'failed'
                });
            }

        });
           
    }else{

        res.send({
            'result': 'failed',
            'error': "Invalid Username !!" 
        });

    }
    
    
}

// OTP Validation controller

exports.AccessOTPValidate = (req,res,next)=>{
    console.log("AccessOTPValidate ...... ")

    let email = req.query.email;
    let doctor_id = req.query.doctor_id;
    let patient_id = req.query.patient_id;
    let otp = req.query.otp;

    let loopVar
    console.log("Checking for Valid Credentials ...... ")
    
    for(loopVar=0;loopVar<accessOTP_auth.length;++loopVar){
    
    if( 

        email == accessOTP_auth[loopVar][0] && 
        doctor_id == accessOTP_auth[loopVar][1] &&
        patient_id == accessOTP_auth[loopVar][2] && 
        otp == accessOTP_auth[loopVar][3]   ){


        console.log("Found valid credentials .... ")
        accessOTP_auth.splice(loopVar,1);
        console.log("Sending response .....")


        res.send({

            'result': 'success',
            'patient_id':patient_id,
            'doctor_id':doctor_id

        })
        break;
    }

    if(loopVar==(accessOTP_auth.length-1))
    console.log("No Valid Credentials Found .... ")
        res.send({
            'result': 'failed'
        })

    }

    
}


var requestArray = [];

exports.requestAccess = function (req, res, next) {

    console.log("\n\nRequest Array : ",requestArray,"\n\n")
    
    requestArray['req.query.id',req.query.email,Date.now()]

    res.send({
        'result': "success"
    });
}


exports.getRequestAccess = function (req, res, next) {
    
    var id = req.query.id;
    console.log("Patient ID : ",id )
    //console.log("Request Access : ",requestArray)
    var i;
    var accessData = []
    for(i=0;i<requestArray.length;++i){
        if(requestArray[i][0] == id ){
            accessData.push([ requestArray[i][1],requestArray[i][2]])
        }
    }
    res.send({'result': 'success', 'access': accessData });
}

exports.getRequestApprove = function (req, res, next) {
    requestArray['req.query.id'].approved=true;
    res.send({'result': 'success'});
}



async function invoke(func_name, args, res){
    try {

        const ccpPath = path.resolve(__dirname, '..', 'first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const identity = await wallet.get('user1');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        let result;

        console.log("\n\nSubmitting ",func_name," Transaction .... \n\n")
        
        if(args.length == 2 ){
            result = await contract.createTransaction(func_name)
                .submit(args[0],args[1]);

        }else if(args.length == 8 ){

            result = await contract.createTransaction(func_name)
                .submit(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);

        }else{

            result = await contract.createTransaction(func_name)
                .submit(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7],args[8]);

        }        
        
        console.log(`\n${func_name} Transaction completed ... \n\n`);

        if(func_name == "AddDoctor" || func_name == "AddPatient"){

            console.log("\nCreating Registration Mail .... \n\n");

            var subject = 'EHR Blockchain - Registration ';
            var url = 'http://localhost:6001/production/login.html';
            
            var message = 'Dear <b>' + args[0] + ' ' + args[1] + '</b>, <br/><br/>Congrats!!! You are now successfully registered to the <b>EHR Blockchain System</b>.' +
                '<br/>' +
                'To login to the system, Please login to the following URL: <a href="'+url+'">' + url + '</a>' +
                '<br/>' +
                'User Name for Login : <b> '+ args[0] + ' ' + args[1]+'</b>'+
                '<br/>' +
                '<br/>' +
                'Thank You, Have a Good Day!';
            
            console.log("\n\nSending Mail ... ")
          sendEmail(args[2], subject, message,res,(result)=>{
              if(result == 'success'){
                console.log("\n\nRegistration Confirmation Mail Successfully Sent .... Sending the Response ....\n\n")
                
                    res.send("Success");  
                
        
              }else{
                  console.log("\n\nMailing Failed !! .... Sending the Error Response .... \n\n")
                  res.send("Failed")
              }
          });


        }
        
        if(func_name == "AddReport"){
            console.log("\n\nSending Response .... \n\n")
            res.send(args[6])
        }else if(func_name != 'AddDoctor' && func_name != 'AddPatient'){
            console.log("\n\nSending Response .... \n\n")
            res.send("Success");  
        }
        
              
    } catch (error) {

        console.error("\n\n\nFailed to submit transaction : ",error );
        res.send({result : "failed"});
    }

}



async function query(func_name, args, list_name, res) {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const identity = await wallet.get('user1');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        let result;
        if(args.length == 0 ){
            
            result = await contract.createTransaction(func_name).evaluate()
            
        }else if(args.length == 1 ){
            
            result = await contract.createTransaction(func_name).evaluate(args[0]);
            
        }        
        
        console.log(`\nTransaction has been evaluated, ${list_name} response sent ....\n`);


        res.send({ result : "success" ,
                    [list_name] : JSON.parse(result)            
    })
    } catch (error) {
        console.error("Failed to evaluate transaction (query): " ,error);
        res.send({result : "failed"});
    }
}


async function queryCount(func_name, res){
    try {

        
        const ccpPath = path.resolve(__dirname, '..', 'first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const identity = await wallet.get('user1');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        let result = await contract.createTransaction(func_name).evaluate();
        console.log(`\n${func_name} : Count => `,JSON.parse(result).length,"\n");

        res.send({  result : "success" ,
                    count : JSON.parse(result).length             
    })
    } catch (error) {
        console.error("Failed to evaluate transaction(queryCount): ",error);
        res.send({result : "failed"});
    }
} 


async function queryValues(func_name, args, list_name, res,callback){
    try {

        const ccpPath = path.resolve(__dirname, '..', 'first-network', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const identity = await wallet.get('user1');
        if (!identity) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');
        let result;
        
        if(args.length == 0 ){
        
            result = await contract.createTransaction(func_name).evaluate();
        
        }else if(args.length == 1 ){
        
            result = await contract.createTransaction(func_name).evaluate(args[0])
        
        }        
        let JSONRes = JSON.parse(result);
        console.log("\n\n",func_name," Values Fetched Successfully! ");
        return callback(JSONRes);

    } catch (error) {
        console.error("Failed to evaluate transaction(queryValues): " ,error);
        res.send({result : "failed"});
    }
}




// IPFS File Upload //

exports.addFile = (req,res,next)=>{
  try {  
    
    console.log("\n\nInside addFile Controller ..... \n\n")
    const file = req.files.file;
    const fileName = req.body.patientID+" "+req.body.reportName;
    const filePath = 'File Upload/'+fileName;

    file.mv(filePath, async (err)=>{
        if(err){
            return res.status(500).send(err)
        }
        const fileHash = await fileAdd(fileName,filePath)

        fs.unlink(filePath, (err) =>{ 
            if(err) console.log(err)
        })

        var refDoctor   = req.body.refDoctor;
        var codeID      = req.body.codeID;
        var reportType  = req.body.reportType;
        var reportName  = req.body.reportName;
        var patientID   = req.body.patientID;
        var patientName = req.body.patientName;
        var reportData  = fileHash;
        var date        = req.body.date;
        var submitType  = req.body.submitType;


        var args = [refDoctor, codeID, reportType, reportName, patientName, patientID,
                    reportData, submitType, date];
        
        invoke("AddReport", args, res);
    })
    }catch(err){
        console.log(err)
        res.send({error : err})

    }
}


const fileAdd = async ( fileName, filePath ) => {
    
    console.log("Adding to IPFS ... ")
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({path : filePath,content : file})
    const fileHash = fileAdded[0].hash;
    console.log("IPFS File upload conpleted \n")
    return fileHash

}


function duplicate_email_detection(req,res,callback){
    
    if(req.url == '/composer/client/addPatient'){
        console.log("\n\nChecking for Already Registered Patient email id  \n\n")
        queryValues("GetPatients", [], 'patient_list', res,(patients)=>{
        var i;
        if(patients.length != 0){
            for(i=0;i<patients.length;++i){
            if(patients[i].Record.contact_details.email == req.body.email ){
                console.log("\n\nMail ID already Registered !! \n\n")
                return res.send({ error : "Email already exist !!"})
                
            }
            if(i==(patients.length-1)){
                console.log("No matching data exits !!")
                callback();               
            }
        }
        }else{
            console.log("No Data exists !!")
            callback();  
        }
    }
        
        )
    }else{
        queryValues("GetDoctors", [], 'doctor_list', res,(doctors)=>{
        console.log("\n\nChecking for Already Registered Doctor email id  .......\n\n")
        var i;
        if(doctors.length != 0){
            for(i=0;i<doctors.length;++i){
            if(doctors[i].Record.contact_details.email == req.body.email){
                console.log("\nMail ID already registered !!\n\n")
                return res.send({ error : "Email already exist !!"})
                
            }
            if(i==(doctors.length-1)){
                console.log("No matching data exists !!")
                callback();

            }
        }
        }else{
            console.log("No Data exists !!")
            callback();
        }


            }
            
            )

    }
}
