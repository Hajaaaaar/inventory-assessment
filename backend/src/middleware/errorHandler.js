
const notFound = (req, res, next) => {
  const err = new Error('Route Not Found');
  err.status = 404;
  next(err);
};

// Standard Express Global Error Handler
const errorHandler = (err, req, res, next) => {
  // Use the status code from the error, or default to 500 
  const statusCode = err.status || 500;
  
  res.status(statusCode);
  res.json({
    message: err.message,
    // Only show stack trace in development mode for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };