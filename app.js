const bodyParser = require("body-parser");
const express = require("express");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorsController = require("./controllers/error");
const path = require("path");
const app = express();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const crypto = require("crypto");
const key = require("./keys");

const MONGODB_URI = key.mongoDB.mongoDBUri;

// const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");
const mongoose = require("mongoose");
const { time, timeStamp } = require("console");

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, crypto.randomBytes(64).toString("hex") + "-" + file.originalname);
  },
});

//filter files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
//template engine for ejs
//we will choose ejs throught our project.
app.set("view engine", "ejs");
app.set("views", "views");
//for parsing body
app.use(bodyParser.urlencoded({ extended: false }));
//for images
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);
//for parsing static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
//set cookies and sessions
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
//inittilaze the flash
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

//we can protect our user from csrf attack and authenticated

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

//we can filter out routes

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorsController.get500);
//adding error page
app.use(errorsController.errorPage);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

//this function returns a server, we need to store it.
const port = 3000;
//DB connection using mongoose

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("database connected");
    app.listen(port, () => {
      console.log(`server started at ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

//let's define middlewares between app and server
// app.use( (req, res, next) => {
//     console.log('this is 1st middleware');
//     //for passing the next middleware, we use next keyword;
//     next();
// });

// app.use( (req, res, next) => {
//     console.log('this is 2nd middleware');
//     //for passing the next middleware, we use next keyword;
//     next();
// });
// app.use('/', (req, res, next) => {
//     console.log("this is always runs");
//     next();
// });

//template engine for handlebars
// app.engine('hbs', expressHbs({
//     layoutsDir: 'views/layouts/',
//     defaultLayout: 'main-layout',
//     extname: 'hbs'
// }));
// app.set('view engine', 'hbs');
// app.set('views', 'views');
//template engine for pug
// app.set('view engine', 'pug');
// app.set('views', 'views');

//sequelize concepts

// const sequelize = require("./util/database");
// const Product = require("./models/product");
// const User = require("./models/user");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cart-item");
// const Order = require("./models/order");
// const OrderItem = require("./models/order-item");
//const expressHbs = require("express-handlebars");
//make relations on database
// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE'});
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, {through: CartItem});
// Product.belongsToMany(Cart, {through: CartItem});
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, {through: OrderItem});

//creates the table in the mysql database
// sequelize
//this force is used in order to over write the table
//it will clear all our previous data that is stored
//.sync({ force: true})
// .sync()
// .then( result => {
//     //console.log(result);
//     return User.findByPk(1);
// })
// .then( user => {
//     if(!user) {
//         User.create({name: 'Sourav', email: 'test@test.com'})
//     }
//     return user;
// })
// .then( user => {
//     //console.log(user);
//     return user.createCart();
// })
// .then( cart => {
//     app.listen(port , () => {
//         console.log(`server started at port ${port}`);
//     });
// })
// .catch( err => {
//     console.log(err);
// });

//Special Note
//1.IN package.json in script we need to add a script called start, which is a special
//keyword and we will start the server by only typing "npm start"

//2.IN package.json in script we can add any script without of start, which is a not aspecial
//keyword and we will start the server by only typing "npm run {script name}"

// mongoConnect( client => {
//     console.log(client);
//     app.listen(port, () => {
//         console.log(`server started at port ${port}`);
//     });
// });
