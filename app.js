var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var loginRouter = require("./routes/capabilityRequestMessage");
var systemConfig = require("./routes/systemConfiguration");

var app = express();
var port = 3003;

const allowCrossDomain = (req, res, next) => {
  res.header(`Access-Control-Allow-Origin`, `*`);
  res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
  res.header(`Access-Control-Allow-Headers`, `Content-Type`);
  next();
};

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(allowCrossDomain);

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/systemconfiguration", systemConfig);

app.listen(port, () => {
  console.log(`Hello There, im running in Port ${port}`);
});
