var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var User = require('../model/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {title : 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title : 'Login'});
});


router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid Username or Password' }),
  function(req, res) {
    req.flash('Success', 'You have successfully logged in');
    res.redirect('/');
  });
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){ 
    if(err) throw err;
    if(!user){
      return done(null, false, { message : 'Unknown User'});
    } 
    
    
  User.comparePassword(password, user.password, function(err, isMatch){
    if(err) return done(err);
    if(isMatch){
       return done(null, user);
  } else{
    return done(null, false, { message : 'Invalid Password'})
  }
  });
  });
}));

  /* passport.use(new localStrategy(
    function(username, password, done) {
      user.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));
 */
router.post('/register', upload.single('profileImage'), function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;


  if(req.file){
    console.log('Uploading Image ...');
    var profileImage = req.file.filename;
  }
  else{
    console.log('No image uploaded');
    var profileImage = 'noImage.jpg';
  }

  // Form Validation
  req.checkBody('name', 'Name Field is required').notEmpty();
  req.checkBody('name', 'Email Field is required').notEmpty();
  req.checkBody('email', 'A valid Email is required').isEmail();
  req.checkBody('username', 'Username Field is required').notEmpty();
  req.checkBody('password', 'Password Field is required').notEmpty();
  req.checkBody('password2', 'Confirm Password does not match Password').equals(req.body.password);


  // Error
  var errors = req.validationErrors();
  
  if(errors){
    res.render('register', {
      errors : errors
  });

  
  }else{
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileImage: profileImage
    });
    User.createUser(newUser, (err, user)=>{
      if(err) throw err;
      console.log(user);
    })
    req.flash('Success', 'You are now registered and can login');
    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('Success', 'You have successfully logged out');
  res.redirect('/users/login');
});

module.exports = router;
