// import fetch from "node-fetch";

/* Node.js event loop - Jake Archibald talk
    event loop - executes HS code, collects and processes events, and renders web pages
                 it manages async events and exures that script execution happens in a sequence that respects the order of events and their dependencies 
    both the browser and Node.js are always running a single-threaded event loop to run code
    event loop - checks the call stack and if it is empty, dqueues the next event from the event queue and pushes it onto the call stack to be executed
    first go-around, the event loop runs my synch code, but it may also queue up async events to be called back later
    ex. here's a function I want to run
    but first I need to get data from the network, getData(callback)  
    event loop with continue working in a separate thread pool from the network request
    at a future point, getData finishes and lets the event loop know it's ready to be calledback

    if the next step is a macro-task, like setTimeout or setInterval, which schedule future tasks that are not immediately executed
    (macro-task vs micro-tasks - macro-tasks represent larger units of work/heavier execution loads managed in a queued manner)
    macro-tasks get executed on the next event loop
    micro-tasks, like a fulfilled promise, will be called back before the start of the next event loop

callbacks - happen within the event loop
promises
async/await */

console.log("Synchronous 1"); // L1

// nothing here has time delays
setTimeout((_) => console.log(`Timeout 2`), 0); // L2

Promise.resolve().then((_) => console.log("Promise")); // L3

console.log("Synchronous 4"); // L4

/* L1 gets executed first because it's on the main thread 
then L2 is queued for a future task 
then L3, the promise is queued to run in the micro-task queueimmediately after the current task
then L4 get executed right away 

in the console...
Synchronous 1
Synchronous 4
Promise 4
Timeout 2

even though the setTimeout callback was queued up before the promise, the promise still gets executed first because of the priority of the micro-task queue 


how a promise-based API might be consumed 

fetch - browser-based API, also available on Node via the node-fetch library 
fetch allows me to hit an HTTP endpoint and have the response returned to me as a promise of the response 

fetching data from a remote server is always going to be async  */
const promise = fetch("https://jsonplaceholder.typicode.com/todos/1");

/* so I can queue up the promise and then provide it with a callback to map it to JSON 
promises can be chained together
mapping to JSON is also a promise */
promise
  .then((res) => res.json())
  .then((user) => console.log("hi", user.title))

  /* the catch will handle errors that happen anywhere within my asynchronous code 
  if the code was callback-based, I would need a separate error handler for everysingle async operation 
  
  if an error is thrown anywhere in my code, it's going to bypass all the future then callbacks and go straight to the catch callback */
  .catch((err) => console.log("no!", err));

/* this console log will be run first and then it retrieves the data from the API 
and console log the data afterward */
console.log("Synchronous 5");

/* With promises, I can catch all errors in the chain with a single function by
adding catch to the bottom of my promise chain */

const tick = Date.now();
const log = (v) => console.log(`${v} \n Elapsed: ${Date.now() - tick}ms`);

const codeBlocker = () => {
  /* Blocking    
    // if this code is run on the main thread, all the code will be blocked from executing 
    // until the billion loops are done 
    let i = 0;
    while (i < 1000000000) {
       i++;
    }

    return "billion loops done";
  };
  */

  /* Async blocking

wrap the code in a Promise, so I can get it off the main thread and execute it as a micro-task 
  return new Promise((resolve, reject) => {
    let i = 0;
    while (i < 1000000000) {
      i++;
    }

    // have the Promise resolve to that value when done...but creation of the Promise and the while loop
    // is still happening on the main thread, and only the resolving of the value happens as a micro-task
    resolve("billion loops done");
  });
}; 
*/

  /* Non-blocking

wrap it in a Promise again but run the while loop inside of the result the promise calls back 
by putting the code inside of a resolved promise, I can be guaranteed that it will be executed 
after all the synchronous code in the current macro-task has completed 
instead of just putting the code inside of a promise */
  return Promise.resolve().then((v) => {
    let i = 0;
    while (i < 1000000000) {
      i++;
    }
    return "billion loops done";
  });
};

/* B1. do one console log 
AB1. one console log happens right away 
NB1. one console log happens right away */
log("Synchronous 1");

/* B3. run while loop - my script is frozen until the while loop completes
AB3. while loop blocks on the main thread 
NB3. then promise resolves after a time */
log(codeBlocker());

// codeBlocker().then(log);

/* B2. do another console log
AB2. there's still a delay because the while loop is still blocking on the main thread 
NB2. second console log also happens right away */
log("Synchronous 2");

/* promises are hard to follow when I have a long chain of multiple async events */
function promiseHell() {
  let userId;
  let postId;
  let db;

  db.then((u) => {
    return db.user().then((v) => v.json());
  })
    .then((u) => {
      userId = u.id;
      return db.post(userId).then((v) => v.json());
    })
    .then((p) => {
      postId = p.id;
      return db.comments(postId).then((v) => v.json());
    });
}

/* without the async keyword, the normal function does nothing
with the async keyword, the function now returns a promise of nothing 
whatever get returned inside the function will be a promise of that value 

simulation of how a promise-based API works
user can pass in the name of a fruit, and then the function will resolve to the
value of the fruit emoji from the fruits object */
const getFruit = async (name) => {
  const fruits = {
    pineapple: "🍍",
    peach: "🍑",
    strawberry: "🍓",
  };

  /* if async keyword wasn't here, I could write return Promise.resolve(fruits[name]); 
  which returns a promise that resolves to this value 
  with async, it takes the return value and automatically resolves it as a promise */
  return fruits[name];
};

getFruit("peach").then(console.log);

/* async also sets up the context for me to use await
await pauses the function execution until the getFruit promise is resolved to a value */

/* get multiple fruits and combine them together as a single value 
instead of chaining a bunch of then callbacks, I can have a promise resolve 
to the value of a variable */
const makeSmoothie = async () => {
  // once the getFruit promise is resolved to a value, I can use the value as the variable a
  const a = await getFruit("pineapple");
  const b = await getFruit("strawberry");

  return [a, b];
};

makeSmoothie().then(console.log);

/* one of the annoying things about promises is that's kind of hard to share result values between
multiple steps in the promise chain */
const makeSmoothie2 = () => {
  let a;
  return getFruit("pineapple")
    .then((v) => {
      v = a;
      return getFruit("strawberry");
    })
    .then((v) => v + a);
};

/* I don't need two awaits in the async/await version
I only need to await one thing after the other if the second value is dependent on the first value 
ex. I need to user id before retrieving some data from a db 


imagine I am making these calls from a remote API and there's about 1 sec of latency */
const updatedGetFruit = async (name) => {
  const fruits = {
    pineapple: "🍍",
    peach: "🍑",
    strawberry: "🍓",
  };

  await DelayNode(1000);

  return fruits[name];
};

const updatedMakeSmoothie = async () => {
  const a = getFruit("pineapple");
  const b = getFruit("strawberry");

  /* Promise.all tells all promises in the array to run concurrently and have the resolved values 
  be at that index in the array
  I don't want to accidentally pause a function unnecessarily 
  so now instead, all promises are added to an array, and then await that Promise.all call */
  const smoothie = await Promise.all([a, b]);

  return smoothie;
};

/* another nice benefit of async/await is error handling 
instead of chaining a catch callback to my promise chain,
I can wrap my code in a try-catch block 
this offers much better flexibility when handling errors that might occur across multiple promises */
const badSmoothie = async () => {
  try {
    const a = getFruit("pineapple");
    const b = getFruit("strawberry");
    const smoothie = await Promise.all([a, b]);

    // if I throw an error in the middle of it, I can then catch that error in the catch block
    throw "broken!";

    return smoothie;
  } catch (err) {
    /* I can catch the error and throw another error or I can catch the error and return a value 
        my decision here will dictate the control flow for the consumer of this promise */
    console.log(err);
    /* if I return a value, I'm basically ignoring the error and providing a replacement value 
    so the consumer of this promise won't get an error but instead they'll get the result value 
    inside of the then callback
    if I throw an error inside my catch block, it will break the consumer's promise chain and be
    handled by their catch callback */
    // return `We are going to be fine...`;
    // throw `It's broken!`
  }
};

// I have a string of ids
const fruits = ["peach", "pineapple", "strawberry"];

/* I want to retrieve all these ids from the db 
I can use array map to convert them to an array of promises and then resolve them all concurrently 
using Promise.all
need to be careful when using async/await in a map or a forEach loop
because it won't actually pause the function in this context 
instead it will run all these promises concurrently */
const otherSmoothies = fruits.map(async (v) => {
  const emoji = await getFruit(v);
  log(emoji);
  return emoji;
});

/* if I want to run a loop and have every iteration in that loop await a promise, I need to use
a traditional for loop 
I can write async functions, then write a for loop inside that function, and then use the await
keyword inside the loop 

this will pause each step of the loop until that promise is resolved
(but more often that not, I will want to run everything concurrently */
const fruitLoop = async () => {
  for (const f of fruits) {
    const emoji = await getFruit(v);
    log(emoji);
  }
};

fruitLoop();

/* what I can do is use the await keyword directly in a for loop */
const otherFruitLoop = async () => {
  /* if I have a promise that I know resolves to an array, I use the await keyword directly in the loop
    the for await will await the array of items to resolve */
  for await (const emoji of smoothie) {
    // and then loop over them immediately after
    log(emoji);
  }
};

otherFruitLoop();

const fruitInspection = async () => {
  /* await keyword can also be used directly in my conditionals 
    on the left side of the conditional, I can await the result value from a promise 
    and then I can see if it's equal to some other value */
  if ((await getFruit("peach")) === "🍑") {
    console.log("looks peachy!");
  }
};

fruitInspection();
