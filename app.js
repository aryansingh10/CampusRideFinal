const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const nodemailer = require('nodemailer');

mongoose.connect('mongodb://127.0.0.1:27017/campus_ride_sharing_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB: ', err);
});

const User = require('./models/user');
const Ride = require('./models/ride');
const FormEntry = require('./models/FormEntry');


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); 


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// Create a Nodemailer transporter using your email service's SMTP settings
const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail', 'Yahoo', 'Outlook'
  auth: {
    user: 'campusride4@gmail.com',
    pass: 'mywu nyav mbid kyol',
  },
});


app.post('/send-booking-email', (req, res) => {
  // You'll need to replace the following placeholders with actual data
  const userEmail = req.user.email; // The recipient's email address
  const rideDetails = 'Details of the booked ride'; // Details of the booked ride

  const mailOptions = {
    from: 'campusride4@gmail.com', // Sender's email address
    to: userEmail,
    subject: 'Ride Booking Confirmation',
    text: `Your ride has been booked Successfully`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Failed to send booking confirmation email.');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Booking confirmation email sent.');
    }
  });
});


app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});


function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); 
  }
  req.flash('error', 'You need to be logged in to do that.');
  res.redirect('/login');
}

// Routes
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name
  });

  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash('error', err.message); // Flash error messages
      return res.redirect('/register');
    }
    passport.authenticate('local')(req, res, () => {
      req.flash('success', 'Welcome to Campus Ride Sharing!'); // Flash success message
      res.redirect('/dashboard');
    });
  });
});


app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true, // Enable flash messages for authentication failures
}));

app.get('/login', (req, res) => {
  res.render('login', { messages: req.flash() });
});

app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You have been logged out.');
  res.redirect('/login');
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard');
});


app.get('/offer-a-ride', isAuthenticated, (req, res) => {
  res.render('offerARide');
});

app.post('/offer-a-ride', isAuthenticated, (req, res) => {
  const newRide = new Ride({
    driver: req.user, 
    source: req.body.source,
    destination: req.body.destination,
    date: req.body.date,
    availableSeats: req.body.availableSeats,
    status:req.body.status

  });

  newRide.save()
    .then(() => {
      req.flash('success', 'Ride offered successfully.');
      res.redirect('/dashboard');
    })
    .catch((err) => {
      console.error(err);
      req.flash('error', 'Failed to offer a ride.');
      res.redirect('/offer-a-ride');
    });
});

app.get('/find-a-ride', (req, res) => {
  Ride.find({})
    .then((rides) => {
      res.render('findARide', { rides });
    })
    .catch((err) => {
      console.error(err);
      req.flash('error', 'Failed to find rides.');
      res.status(500).send('Internal Server Error');
    });
});


app.get('/my-rides', isAuthenticated, (req, res) => {
  Ride.find({ driver: req.user })
    .then((rides) => {
      res.render('myRides', { rides });
    })
    .catch((err) => {
      console.error(err);
      req.flash('error', 'Failed to fetch your rides.');
      res.status(500).send('Internal Server Error');
    });
});


app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile');
});

app.post('/search-rides', isAuthenticated, (req, res) => {
  const date = req.body.date;
  const time = req.body.time;
  const pickupLocation = req.body.pickupLocation;

  if (pickupLocation === 'Acropolis Institute of Technology and Research') {
    
    res.redirect('/pickup-location-acropolis');
  } else if (pickupLocation === 'Bhawarkua') {
  
    res.redirect('/pickup-location-bhawarkua');
  } else if (pickupLocation === 'Bengali Square') {

    res.redirect('/pickup-location-bengali-square');
  } else if (pickupLocation === 'Raddison Square') {
   
    res.redirect('/pickup-location-raddison-square');
  } else if (pickupLocation === 'Omexe City') {

    res.redirect('/pickup-location-omexe-city');
  } else {

    res.redirect('/pickup-location-other');
  }
});


app.get('/pickup-location-acropolis', isAuthenticated, (req, res) => {
  res.render('pickupLocationAcropolis');
});

app.get('/pickup-location-bhawarkua', isAuthenticated, (req, res) => {
  res.render('pickupLocationBhawarkua');
});

app.get('/pickup-location-bengali-square', isAuthenticated, (req, res) => {
  res.render('pickupLocationBengaliSquare');
});

app.get('/pickup-location-raddison-square', isAuthenticated, (req, res) => {
  res.render('pickupLocationRaddisonSquare');
});

app.get('/pickup-location-omexe-city', isAuthenticated, (req, res) => {
  res.render('pickupLocationOmexeCity');
});

app.get('/pickup-location-other', isAuthenticated, (req, res) => {
  res.render('pickupLocationOther');
});

app.post('/submit', (req, res) => {
  // Handle form submission here
  const formData = new FormEntry({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    message: req.body.message,
  });

  formData.save()
    .then(() => {
      console.log('Form data saved successfully.');
      res.send("Your Data Has Been Recorded");
    })
    .catch((err) => {
      console.error('Error saving form data:', err);
      res.status(500).send('Error while saving form data');
    });
});


app.get('/submit', (req, res) => {
  res.send('Form submission page'); // This is just a placeholder response.
});

app.get('/payment', isAuthenticated, (req, res) => {
  res.render('payment', { messages: req.flash() });
});


app.post('/payment', isAuthenticated, (req, res) => {

  const paymentSuccess = true; // Set this based on your logic.
  
  if (paymentSuccess) {
    req.flash('success', 'Payment successful.');
    res.redirect('/dashboard'); // Redirect to the dashboard or a thank-you page.
  } else {
    req.flash('error', 'Payment failed. Please try again.');
    res.redirect('/payment'); // Redirect back to the payment page with an error message.
  }
});




const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});