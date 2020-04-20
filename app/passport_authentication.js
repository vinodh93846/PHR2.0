var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(req, res, _next) {

    let url='';
    var orgToken = jwt.sign(
        {
            _id: id,
            _otp: otp
        },
        'jwt_Secret_Key_for_CHiPS_PHR_Of_32Bit_String',
        {
            expiresIn: '1800000'
        });
    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'otp'
      },
        function(username, password, done) {
            if(id == 'Admin') {
                url = 'phr_admin_dash.html';
            } else if (id.includes('Doctor')) {
                url = 'phr_doctor.html?doctor_id='+id;
            } else if (id.includes('Patient')) {
                url = 'phr_patient.html?patient_id='+id;
            }
            if (url != '') {
            result = {'result': 'success',
                      'url': url,
                      'token': orgToken}
            return done(null, result);
            } else {
                return done(null, false, {"message": "Id not Valid."});
            }
            
        }));
}