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
*/
