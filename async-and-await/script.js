/* server object has one property, people, which is an array of objects
each object within the array is a person with name and age properties */
const server = {
  people: [
    {
      name: "Odin",
      age: 20,
    },
    {
      name: "Thor",
      age: 35,
    },
    {
      name: "Freyja",
      age: 29,
    },
  ],

  getPeople() {
    return new Promise((resolve, reject) => {
      // Simulating a delayed network call to the server
      setTimeout(() => {
        // promise resolves after 2 sec, returning the array of people from the server object
        resolve(this.people);
      }, 1000);
    });
  },
};

/* both getPersonsInfoWOAsync and perPersonsInfoWAsync get information from a server, 
process it, and return a promise 


uses promise syntax */
function getPersonsInfoWOAsync(name) {
  // server.getPeople() returns a promise, .then() method handles the resolved value which is the array of people
  return server.getPeople().then((people) => {
    // find() used on the array to locate the first person object whose name property matches the name argument
    return people.find((person) => {
      // returns the result of the find() method, which will be the person object if found or undefined if no match
      return person.name === name;
    });
  });
}

// uses async/await syntax
async function getPersonsInfoWAsync(name) {
  /* await pauses the function execution until the promise from server.getPeople() resolves
  the resolved value, the array of people, is assigned to people */
  const people = await server.getPeople();

  // find() finds the person whose name matches the given name
  const person = people.find((person) => {
    return person.name === name;
  });

  // function returns the found person object or undefined
  return person;
}

/* gets the Odin person object from the server, once the promise from getPersonInfoWOAsynd resolves
.then() handles the resolved value, Odin person object */
getPersonsInfoWOAsync("Odin").then((person) => {
  // if the Odin person object is found
  if (person) {
    // log this string followed by the Odin person object
    console.log("Without async/await:", person);
  } else {
    // otherwise, log this string
    console.log("Without async/await: No person found.");
  }
});

// gets a person object from the server
async function executeAsync(name) {
  try {
    /* await pauses the function execution until the promise from getPersonInfoWAsync resolves 
    the resolve valued, the person object, is assigned to person */
    const person = await getPersonsInfoWAsync(name);

    // if the person object is found
    if (person) {
      // log this string followed by the person object
      console.log("With async/await:", person);
    } else {
      // otherwise, log this string
      console.log("With async/await: No person found.");
    }

    // if error is caught, log error
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

executeAsync("Freyja");

/* async functions are syntactical sugar for promises 

async keyword lets the JS engine know that I am declaring an async function 
the async keyword is required to use await inside any function 

a function declared with async, automaticallt returns a promise 

returning in an async function is the same as resolving a promise 
throwing an error in an async* function will reject the promise */
const yourAsyncFunction = async () => {
  // do something asynchronously and return a promise
  // return result;
};

function someAsyncOperation(input) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate operation success by resolving the promise
      resolve(`Processed data for input: ${input}`);
      console.log(input);
    }, 2000); // Delay of 2000 milliseconds (2 second)
  });
}

// await pauses function execution until the promise from executeAsync resolves, returning the person object
const myAsyncFunction = async () => {
  await executeAsync("Thor");
};

myAsyncFunction();

/* it is valid to use an async function anywhere I can use a normal function */

// anArray.forEach(async (item) => {
/* do something asynchronously for each item in 'anArray' 
    could also use .map here to return an array of promises to use with 'Promise.all()'*/
// });

// iterates through the people array and for each person object
server.people.forEach(async (person) => {
  // delay of 2 sec then log the age for each person object
  await someAsyncOperation(person.age);
});

// gets the array of people from the server
server.getPeople().then(async (people) => {
  // iterates through each person in the array
  for (const person of people) {
    // gets the first letter of their name
    let nameInitial = person.name[0];

    // delay of 2 sec then log the first letter of the name for each person object
    await someAsyncOperation(nameInitial);
  }
});

/* await - tells JS to wait for an asynch action to finish before continuting the function, 
           it's like "pause until done" 
await keyword is used to get a value from a function where I would normally use .then()
instead of calling .then() after the async function, I would assign a variable to the result using await
then I can use the result in my code as I would in synchronous code 

promises have the .catch() method for handling rejected promises */

/* async functions just return a promise, so call the function and append .catch() to the end to handle errors */
myAsyncFunction().catch((err) => {
  console.error(err);
});

/* to handle the error directly inside the async function, use try/catch just like I would inside sync code
async function executeAsync(name) {
  try {
    const person = await getPersonsInfoWAsync(name);
    if (person) {
      console.log("With async/await:", person);
    } else {
      console.log("With async/await: No person found.");
    }
  } catch (error) {
    console.error("Error occurred:", error);
  }
}



async before function means: the function always returns a promise 
other values are wrapped in a resolved promise automatically */
async function a() {
  return 1;
}

// function returns a resolved promise with the result of 1
a().then(alert); // 1

// same as explicitly returning a promise
async function b() {
  return Promise.resolve(1);
}

b().then(alert); // 1

/* await - makes JS wait until the promise settles and returns its result 


example with a promise that resolves in 1 sec */
async function c() {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), 1000);
  });

  // function execution pauses, waits until the promise resolves and then resumes with the promise result
  let result = await promise;

  alert(result);
}

c();

/* async/await is just more elegant than getting the promise result with promise.then */

function showAvatarWOAsyncAwait() {
  // makes a request for user.json
  fetch("/article/promise-chaining/user.json")
    // load response body as json
    .then((response) => response.json())

    // make a request to GitHub
    .then((user) => fetch("https://api.github.com/users/${user.name}"))

    // load the response body as json
    .then((response) => response.json())

    // show the avatar image (githubUser.avatar_url) for 3 seconds
    .then((githubUser) => {
      let img = document.createElement("img");
      img.src = githubUser.avatar_url;
      img.className = "promise-avatar-example";
      document.body.append(img);

      setTimeout(() => {
        img.remove(), resolve(githubUser);
      }, 3000);
    })

    // triggers after 3 sec
    .then((githubUser) => alert(`Finished showing ${githubUser.name}`));
}

async function showAvatorWAsyncAwait() {
  /* await on top level work just find inside a module in modern browsers 
    if modules aren't used or older browsers must be supported, wrap it into an anonymous function 
    
    (async () => {
        let response = await fetch("/article/promise-chaining/user.json");
        let user = await response.json();
        ...
    })();

    */
  // read the json
  let response = await fetch("/article/promise-chaining/user.json");
  let user = await response.json();

  // read github user
  let githubResponse = await fetch("https://api.github.com/users/${user.name}");
  let githubUser = await githubResponse.json();

  // show avatar
  let img = document.createElement("img");
  img.src = githubUser.avatar_url;
  img.className = "promise-avatar-example";
  document.bodu.append(img);

  // wait 3 sec
  await new Promise((resolve, reject) => setTimeout(resolve, 3000));

  img.remove();

  return githubUser;
}

/* like promise.then, await allows the use of thenable objects (those with a callable then method)
a third-party object may not be a promise, but promise-compatible if it supports .then, that's enough to use it with await 


use of an async function and a custom Thenable class that conforms to the thenable protocol, allowing it to be used with await 
*/
class Thenable {
  constructor(num) {
    // num value represents the numeric state of an instance of Thenable
    this.num = num;
  }

  /* then method makes the object thenable 
  then method is what promises and sync operations look for to determine if an object can be awaited 
  resolve and reject functions are args 
  resolve is called to resolve the promise, reject is called to reject it */
  then(resolve, reject) {
    // alert box displaying the result function as a string
    alert(resolve);

    /* resolves with this.num*2 after 1 sec 
    Thenable resolves with its number value doubled after a delay of 1 sec */
    setTimeout(() => resolve(this.num * 2), 1000);
  }
}

async function d() {
  /* if await gets a non-promise object with .then, await calls that method with the built-in functions, resolve and reject as args 
  await then waits until one of them is called and then proceeds with the result 
  
  await pauses execution of d until the Thenable instance resolves */
  // waits for 1 second, then result becomes 2
  let result = await new Thenable(1);

  // once the await completes, alert displays the result which is 2
  alert(result);
}

d();

class Waiter {
  // declares an async class method
  async wait() {
    // ensures the returned value is a promise and enables await
    return await Promise.resolve(1);
  }
}

new Waiter().wait().then(alert); // 1 this is the same as (result => alert(result))

// error handling below are the same
async function e() {
  await Promise.reject(new Error("Whoops!"));
}

async function f() {
  throw new Error("Whoops!");
}

/* in real situations, the promise may take some time before it rejects
in that case there will be a delay before await throws an error

errors can be caught using try...catch, the same way as a regular throw */
async function g() {
  try {
    let response = await fetch("/no-user-here");
    let user = await response.json();

    // in case of an error, the control jumps to the catch block
  } catch (err) {
    // catches errors both in fetch and response.json
    alert(err);
  }
}
g();

/* when using async/await, I'll rarely need .then because await handles the waiting for me 
and I can use a regular try...catch instead of .catch */

async function h() {
  let response = await fetch("http://no-such-url");
}

/* at the top level of the code tho, when I'm outside any async function, I am syntactically unable to
use await, so it's a normal practice to add .then/catch to handle the final result or falling-through error */
// h() becomes a rejected promise
h().catch(alert); // handles the rejected promise; Type Error: failed to fetch

/* when I need to wait for multiple promises, I can wrap them in Promise.all and then await
wait for the array of results 
*/
// let results = await Promise.all([fetch(url1), fetch(url2)]);
/* in case of error, it propagates as usual, from the failed promise to Promise.all, and then becomes an 
exception that I can catch using try..catch around the call

sometimes in the outermost scope, I have to use promise.then/catch */

async function loadJson(url) {
  let response = await fetch(url);
  if (response.status == 200) {
    return response.json();
  }
  throw new Error(response.status);
}

loadJson("https://javascript.info/no-such-user.json").catch(alert); // Error: 404

// defines a custom error class for HTTP errors
class HttpError extends Error {
  // constructor takes a response object from a fetch call
  constructor(response) {
    // calls the parent class contructor with a message, helps in logging and debugging
    super(`${response.status} for ${response.url}`);

    // property identifying the type of error
    this.name = "HttpError";

    // stores the response object, allowing handlers to access the full response details outside the constructor
    this.response = response;
  }
}

// function to fetch JSON data from a specified url
async function otherLoadJson(url) {
  // sends an HTTP request to the specified url and awaits its response
  let response = await fetch(url);

  // if the request is successful
  if (response.status == 200) {
    // returns the body of the response parsed as JSON
    return response.json();
  } else {
    // otherwise, throw an instance of HttpError, passing the response object to the constructor
    throw new HttpError(response);
  }
}

// ask for a user name until github returns a valid user from GitHUb's API
async function demoGithubUser() {
  let user;

  // an infinite loop to repeatedly ask for user input until a valid username is fetched
  while (true) {
    let name = prompt("Enter a name?", "iliakan");

    try {
      // calls otherLoadJson with the GitHub API url tailored to the entered username
      let user = await otherLoadJson(`https://api.github.com/users/${name}`);

      // if otherLoadJson successfully retrieves the user data, exits the loop
      break; // no error, exit loop
    } catch (error) {
      // if the user does not exist on GitHub
      if (error instanceof HttpError && error.response.status == 404) {
        // informs the user and loop continues after the alert
        alert("No such user, please reenter.");
      } else {
        // unknown error, rethrow, meaning there was an unexpected issue
        throw error;
      }
    }
  }

  // once a valid user is found, displays the user's full name and returns the user object
  alert(`Full name: ${user.name}`);
  return user;
}

// starts the user interaction process immediately
demoGithubUser();

async function wait() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return 10;
}

function f() {
  wait().then((result) => alert(result));
}

f();

/* flow control today in JS is really hard 
promises - iou for something that's going to happen at some point in the future
exs of promises
- ajax call returning data
- access to a user's webcam
- resizing an image

JS waits for nobody, it's almost entirely asynchronous, non-blocking

run function that return a promise of the data that will come at a later point in time
use .then() to listen for the data coming back 
promises can be wrapped in a mega-promise, Promise.all - wait until all the promises are resolved 
until I go forward and deal with the result

a lot of new browser apis are being built on promises
fetch()
*/
fetch("http://cooldogs.org")
  .then((data) => data.json())
  .then((dogs) => pet(dogs));

/* another browser api, library called axios
that has built in defaults

axios.get('http://cooldogs.org')
    .then(dogs => pet(dogs));

many more browser apis, 
paymentRequest
getUserMedia()
Web Animation API
all of these are being built on standard promises 
*/

function sleep(amount) {
  return new Promise((resolve, reject) => {
    if (amount <= 300) {
      return reject("That is too fast, cool it down!");
    }
    setTimeout(() => resolve(`Slept for ${amount}`), amount);
  });
}

sleep(500)
  .then((result) => {
    console.log(result);
    return sleep(1000);
  })
  .then((result) => {
    console.log(result);
    return sleep(750);
  })
  .then((result) => {
    console.log(result);
    console.log("Done!");
  });

/* any code that needs to come after the promise, still needs to be in the final .then() callback 
moveTo(50, 50)
    .then(() => moveTo(20, 100))
    .then(() => moveTo(100, 200))
    .then() => moveTo(2, 10))
    
async function animate() {
    await moveTo(50, 50);
    await moveTo(20, 100);
    await moveTo(100, 200);
    await moveTo(2, 10);
} 
*/

// put both promises into variables
const wesPromise = axios.get("https://api.github.com/users/wesbos");
const scottPromise = axios.get("https://api.github.com/users/stolinski");

// wait until both of them come back and then I can use the data
Promise.all([wesPromise, scottPromise]).then(([wes, scott]) => {
  const html = `
            <h1>${wes.name}</h1>
            <h1>${scott.name}</h1>
        `;
});

async function go() {
  // just wait
  await sleep(1000);

  // or capture the returned value
  const response = await sleep(750);
  console.log(response);
}

const getDetailsSlowly = async function () {
  const wes = await axios.get("https://api.github.com/users/wesbos");
  const scott = await axios.get("https://api.github.com/users/stolinski");
  const html = `
            <h1>${wes.name}</h1>
            <h1>${scott.name}</h1>
        `;
};

const getDetailsQuickly = async function () {
  const wesPromise = axios.get("https://api.github.com/users/wesbos");
  const scottPromise = axios.get("https://api.github.com/users/stolinski");

  const [wes, scott] = await Promise.all([wesPromise, scottPromise]);
  const html = `
        <h1>${wes.name}</h1>
        <h1>${scott.name}</h1>
    `;
};

/* to handle errors
1. wrap the function in a try/catch */
async function displayData() {
  try {
    const wes = await axios.get("https://api.github.com/users/wesbos");
    console.log(data);
  } catch (err) {
    console.log(err);
  }
}

/* 2. higher order function
async functions can chain a .catch() 

create a function without any error handling */
async function yolo() {
  /* do something that errors out 
    might be a 404, might be a syntax error */
  const wes = await axios.get("https://no.com");
}

function handleError(yolo) {
  return function (...params) {
    // just add a .catch() at the end to handle errors
    return yolo(...params).catch(function (err) {
      // do something with the error!
      console.error(`Oops!`, err);
    });
  };
}

// Wrap the unsafe function in a higher order function
const safeYolo = handleError(yolo);
safeYolo();

/* this is very handy with Node.js and Express apps */

// Start with a regular Route where an error could happen
const getOrders = async (req, res, next) => {
  const orders = Orders.find({ email: req.user.email });

  if (!orders.length) throw Error("No Orders Found");
};

// since this is unhandled, this route would cause the capp to quit
router.get("/orders", getOrders);

const displayErrors = async (error, req, res, next) => {
  res.status(err.status || 500);
  res.render("error", { error });
};

// any time I call next('Something Happened') displayErrors will kick in
app.use(displayErrors);

/* 4. handle the error when I call it */
async function loadData() {
  const wes = await axios.get("...");
}

loadData().catch(dealWithErrors);
