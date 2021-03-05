//! Cors
//only certain origins can access this site
//*myserver.com ---> request some data ---> server(myserver.com)
//*myserver.com <---give you data back <---server(myserver.com)
//Same-Origin policies prevent Cross-origins policies
//*localhost/5464 ---> request some data ---> server(myserver.com)
//! ACCESS DENIED!
//* Server has CORS = only allowing access from certain origins (localhost/5464) not included

//! Proxy
//* Can do many things but one thing it can do is to camouflage the request to the server origin

//*localhost/5464 ---> request some data ---> server(myserver.com)
//! Now with a proxy
//*localhost/5464 ---> request some data ---> PROXY --> server(myserver.com)
//! Intercepts the request and camouflages itself as the same origin
//*localhost/5464 ---> request some data ---> server.com --> server(myserver.com)
//! Proxy then will get the data and send it back to whoever requested it
//*localhost/5464 ---> sending data back<--- proxy <---server(myserver.com)
