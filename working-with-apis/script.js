/* simplest use of fetch() takes one arg, the path to the resource I want to fetch
fetch() returns a promise that resolves with a Response object
Response object is a representation of the entire HTTP response 
use json() method and return a second promise that resolves with the result of parsing the response body text as JSON 

files can be uploaded using an HTML input type="file" multiple input element, FormData(), and fetch() 
to handle an async POST request 

async enables use of await to handle promises */
async function uploadMultiple(formData) {
  /* try block will catch any errors that might occur during the fetch operation
  or processing the response */
  try {
    const response = await fetch("https://example.com/posts", {
      /* performs a fetch request using POST HTTP method to the url, await pauses the function execution 
      until the fetch request completes */
      method: "POST",

      /* includes the formData object as the payload of the request, which contains the data to be uploaded */
      body: formData,
    });

    //processes the JSON response by awaiting the conversion of JSON content of teh response to a JS object
    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

// this element will contain the photos to be uploaded
const photos = document.querySelector('input[type="file"][multiple]');

// creates a new FormData object that will be used to compile the form data to be sent with the HTTP request
const formData = new FormData();

// appends a text field, title is the key and My Vegas Vacation is the value, which is metadata
formData.append("title", "My Vegas Vacation");

// iterates over the files collection of the photos input element
for (const [i, photo] of Array.from(photos.files).entries()) {
  // in each iteration, the file is appended to the formData under a dynamically named key (photos_0, photos_1, etc. )
  formData.append(`photos_${i}`, photo);
}

// calls uploadMultiple, the formData contains the user's selected files and additional data
uploadMultiple(formData);

// this is an async solution for interacting with server-side APIs that accept mutlipart/form-data

/* chunks that are read from a response are not broken neatly at line boundaries and are Uint8Arrays, not strings
if I want to fetch a text file and process it line by line, I can create a line iterator 
* asynchronous generator function that reads a text file from a url line by line, and a
runner function that iterates over each line to process it 
generator function* - function that can pause its execution and later resume, allowing it to generate a sequence
                      of results over time rather than computing them all at once */
async function* makeTextFileLineIterator(fileURL) {
  /* creates an instance of TextDecoder to decode streams of binary data into text using UTF-8 encoding
   utf-8 - widely used encoding system for representing characters as binary data 
   textDecoder - web API for decoding binary data into text using a specific character encoding, such as utf-8 */
  const utf8Decoder = new TextDecoder("utf-8");

  /* use fetch API to make HTTP request to fileURL
  await pauses the function until the fetch operation completes and the response obj is populated */
  const response = await fetch(fileURL);

  /* retrieves a readable stream reader from the response body
  reader allows me to read the content of the response in chunks 
  getReader() is part of the Streams API, used with ReadableStreams
  getReader() is a mechanism to read data from a stream in a controlled and responsive manner */
  const reader = response.body.getReader();

  /* reads a chunk from the reader, destructures the result to get chunk (a Uint8Array) and readerDone
  (a boolean indicating whether the stream has been fully read) */
  let { value: chunk, done: readerDone } = await reader.read();

  /* decodes the binary chunk into a string using utf-8, if chunk is null, it assigns an empty string to chunk */
  chunk = chunk ? utf8Decoder.decode(chunk) : "";

  // regex to match newline characters used to identify the end of each line in the text
  const newline = /\r?\n/gm;

  // keeps track of the beginning of the current line within chunk
  let startIndex = 0;

  // result stores the results of the newline regex execution
  let result;

  // starts an infinite loop which will continue until manually broken out of
  while (true) {
    /* executes the newline regex on chunk, finding the next match */
    const result = newline.exec(chunk);

    // if no newline is found, checks if the reader is done
    if (!result) {
      // if the reader is done, if readerDone becomes true, exits the loop
      if (readerDone) break;

      /* otherwise, extract the remainder of the text in chunk starting from startIndex
      startIndex points to the start of a line that hasn't yet been completed
      remainder holds this incomplete line which may need to be concatenated with the
      next chunk to form a complete line  */
      const remainder = chunk.substr(startIndex);

      /* code reads the next chunk of data from the stream asynchronously 
      await reader.read() fetches the next part of the data, returning an object containing
      value (the next chunk of data as a Uint8Array) and done
      the new data is stored in chunk and readDone is updated to reflect whether there is more data to read */
      ({ value: chunk, done: readerDone } = await reader.read());

      /* concatenates the remainder from the previous chunk with the newly read chunk
      if chunk is not empty, there was new data read, the chunk is first decoded 
      from a Uint8Array into  a string using utf8Decoder.decode()
      uf chunk is empty, it concatenates with an empty string, making chunk equal to remainder */
      chunk = remainder + (chunk ? utf8Decoder.decode(chunk) : "");

      /* reset the startIndex to 0 for the next ieration
      processing will start at the beginning of the new chunk
      newline.lastIndex is reset to 0 to ensure regex search starts from the start of the new concatenated chunk */
      startIndex = newline.lastIndex = 0;

      /* tells the loop to skip the remaining part of the current iteration and start the next one 
      when the iteration does not result in a complete line, the continue ensures that the loop starts again to
      process the newly formed chunk*/
      continue;
    }

    /* yields a substring of chunk starting from startIndex up to result.index where result.index is the position of
    the newline character found by newline.exec(chunk) 
    extracts and yields a complete line of text, excluding the newline character */
    yield chunk.substring(startIndex, result.index);

    /* updates startIndex to newline.lastIndex, the position immediately after the last matched newline character
    sets up the starting index for the next call to yield when searching for the next line in the remaining part of the chunk */
    startIndex = newline.lastIndex;
  }

  /* check if startIndex is less than the length of chunk, which whould indicate that there's remaining text in chunk 
  after the last newline character */
  if (startIndex < chunk.length) {
    /* Last line didn't end in a newline char 
    if the check is true, yields the remaining text as a line 
    handles the last line of the file or data stream, which may not end in a newline character */
    yield chunk.substr(startIndex);
  }
}

function processLine(line) {
  console.log("Processed line: ", line);
}

/* run is designed to consume the lines produced by the makeTextFileLineIterator */
async function run() {
  /* for await...of - used to iterate over asynchronous iterable objects, returned by an async generators 
  iterates over each line returned by makeTextFileLineIterator(urlOfFile), calling processLine(line) for each line */
  for await (const line of makeTextFileLineIterator(urlOfFile)) {
    processLine(line);
  }
}

/* initiates the processing of lines from the file located at urlOfFile, but it doesn't wait for the process to complete 
the async workflow continues independently of the initial thread of execution */
run();

/* fetch() promise will reject with a TypeError when a network error is encountered or CORS is misconfigured on the server-side
accurate check for a successful fetch() would include checking that the promise resolved,
then checking that the Response.ok property has a value of true 

await here handles promises in a synchronous-like manner */
async function fetchImage() {
  try {
    // await here pauses the function execution until the fetch operation completes, returning the Response object
    const response = await fetch("flowers.jpg");

    // if the ok property of the response object does not return true
    if (!response.ok) {
      // throws an error and moves control to the catch block
      throw new Error("Network response was not OK");
    }

    /* blob() method reads the response body as a binary object, and extracts as Blob object
    await here pauses execution until the method completes */
    const myBlob = await response.blob();

    /* URL.createObjectURL() creates a DOM string containing a url representing the Blob object 
    the url can be used as source for image elements, allowing the blob data to be used as an image source without
    having to read the file into memory as a data url */
    myImage.src = URL.createObjectURL(myBlob);

    // handles errors like network errors, problems with the fetch operation, and issues creating the blob or object url
  } catch (error) {
    console.error("There has been a problem with your fetch operation:", error);
  }
}
/* handles a common async task- fetching a resource over the network, while providing error handling and user feedback */

/* instead of passing a path to the resource I want to request into the fetch() call, I can create a request object 
using the Request() constructor, and pass that in as a fetch() method argument.
this allows for detailed configuration of the request, reusable requests, 
creating a Request object separately from using it in a fetch() call, makes the code readable and easier to maintain,
separates the setup of the request from its execution,
service works can intercept Request objects to modify requests on the fly, use catching strategies, and handle offline capabilities,
gives me the ability to cancel fetch operations,
and I can define default settings that can be resused 
here fetchImage is designed to be reusable and handle any Request object 
request is expected to be a Request object configured for fetching resources */
async function fetchImage(request) {
  try {
    /* fetches the resource - await pauses the execution of the function until the promise returned by fetch
    is resolved,resulting in a Reponse object stored in response  */
    const response = await fetch(request);

    /* check the response - if the ok property of the Response object is not true, throw a custom error */
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }

    // extracts a Bob object from the response using the blob() method that represents the fetched file as binary data
    const myBlob = await response.blob();

    /* creates a url representing the blob object 
    the url is used as the stc attribute of an image element, so the binary data of the image is displayed in the HTML doc */
    myImage.src = URL.createObjectURL(myBlob);
  } catch (error) {
    console.error("Error:", error);
  }
}

// creates a new Headers object, which can be used to append HTTP headers to the request
const myHeaders = new Headers();

/* create a new Request object named myRequest
the object is configured to fetch flowers.jpg using the GET method
request is set to use CORS and the default cache mode  */
const myRequest = new Request("flowers.jpg", {
  method: "GET",
  headers: myHeaders,
  mode: "cors",
  cache: "default",
});

// initiates the process of fetching the image as configured and handling as described
fetchImage(myRequest);

/* Request() accepts exactly the same parameters as fetch() 
I can eeven pass in an existing request object to create a copy of it 
request and response bodies can only be used once 
I can effectibely use the request/response again while varying the init options 
the copy must be made before the body is read 

creates new Request object with the same settings as myRequest 
myInit is an object containing configuration settings that I want to apply to the new Request object 
settings in myInit can override the corresponding settings from the original Request object 
anotherRequest contains a Request object configured as per myRequest parameters, overridden by anything specified in myInit */
const anotherRequest = new Request(myRequest, myInit);
/* the Request constructor here effectively clones the first request and applies modifications from the second parameter */

/* variable used to calculate content length for the HTTP headers */
const content = "Hello World";

// new Headers object stores HTTP headers, creates and appends headers manually
const myHeaders2 = new Headers();

// content type of the HTTP request or response is plain text
myHeaders2.append("Content-Type", "text/plain");

// length of the request or response body in bytes
myHeaders2.append("Content-Length", content.length.toString());

// custom header for an app-specific purpose
myHeaders2.append("X-Custom-Header", "ProcessThisImmediately");

/* creates headers with predefined values 
initializes a new Headers object directly with multiple headers
object literal where each key-value pair represents a header field and its value */
const myHeaders3 = new Headers({
  "Content-Type": "text/plain",
  "Content-Length": content.length.toString(),
  "X-Custom-Header": "ProcessThisImmediately",
});

/* checks has, sets, appends, gets and deletes headers 
the contents can be queried and retrieved */
console.log(myHeaders2.has("Content-Type")); // true
console.log(myHeaders2.has("Set-Cookie")); // false
myHeaders2.set("Content-Type", "text/html");
myHeaders2.append("X-Custom-Header", "AnotherValue");

console.log(myHeaders2.get("Content-Length")); // 11
console.log(myHeaders2.get("X-Custom-Header")); // ['ProcessThisImmediately', 'AnotherValue']

myHeaders2.delete("X-Custom-Header");
console.log(myHeaders2.get("X-Custom-Header")); // null

/* all the Headers methods throw a TypeError if a header name is used that is not a valid HTTP Header name 

creates a new Response object that represents a network error
useful for simulating network errors during testing or handling unexpected network conditions */
const myResponse = Response.error();

try {
  /* Origin header is a critical header in web security, used by browsers to indicate the origin from which the request came 
  headers of a Response object created via Response.error() are immutable,
  the response is intended to represent an immutable network error state */
  myResponse.headers.set("Origin", "http://mybank.com");
} catch (e) {
  console.log("Cannot pretend to be a bank!");
}

/* good use case for headers is checking whether the content type is correct before I process it further 
fetches data from a url specified by a Request object and ensures that the fetch data is in JSON format 
before attempting to parse it */

// request is a Request object that configures the HTTP request
async function fetchJSON(request) {
  try {
    /* performs an HTTP fetch operation using the request parameter 
    waits for the fetch to complete and assigns the resulting Respose object to the variable response
    this Response object contains all the details about the response from the server */
    const response = await fetch(request);

    // retrieves the Content-Type header from the response
    const contentType = response.headers.get("content-type");

    // checks if the contentType is not present or does not include the substring "application/json"
    if (!contentType || !contentType.includes("application/json")) {
      /* if either condition is true, throws a TypeError with a message saying that the expected JSON was not returned */
      throw new TypeError("Oops, we haven't got JSON!");
    }

    /* parses the JSON content of the response body,
    .json() returns a promise that resolves with the result of parsing the body text as JSON */
    const jsonData = await response.json();

    // process your data further
  } catch (error) {
    console.error("Error:", error);
  }
}

/* headers can be sent in request and received in responses, they have limitations about what information can and should be mutable
the guard proeprty controls how and whether certain headers can be modified 
none: default
request: guard for a headers object obtained from a request (Request.headers)
request-no-cors: guard for a headers object obtained from a request created with Request.mode no-cors
response:  guard for a heasders object obtained from a response (Response.headers)
immutable: guard that renders a headers object read-only 


Response instances are returned when fetch() promises are resolved 

the most common response properties-

Response.status - an integer, default value 200, containing the response status code
Response.statusText - a string (default value "") which corresponds to the HTTP status code message
Response.ok - shorthand for checking that status is in the range 200-299 inclusive, returns a boolean value

response properties can be created programmatically via JS, but this is only useful in ServiceWorkers, when
I am providing a custom response to a received request using a respondWith() method 


new Blob object assigned to the myBody variable 
Blobs are used to represent data that isn't necessarily in a JS-native format 
this is a placeholder for where the body content would be defined or added later */
const myBody = new Blob();

/* adds an event listener to the Server Worker's scope that listens for fetch events 
event is the fetch event that contains information about the request and methods to manipulate the response
Service Worker - type of web worker that is a JS script that runs in the background of the browser, allowing for 
                 features that don't need a web page or user interaction; used to intercept and handle network responses,
                 including programmatically managing a cache of responses 
                 
how to use a service worker to intercept and handle fetch events (when a web page makes a network request) */
addEventListener("fetch", (event) => {
  /* ServiceWorker intercepting a fetch 
  this method provides a response to the fetch, allows the service worker to intercept and override the network request
  with a custom response 
  = could be for a custom static response
  - could be a fallback in case the network is unavailable
  the method takes a promise that resolves to a Response object or directly to a Response object */
  event.respondWith(
    /* creates a new Response object that will be returned to the web page or app making the fetch request 
    myBody is the body of the response */
    new Response(myBody, {
      /* configuration object with headers defined, indicating the response body is plain text */
      headers: { "Content-Type": "text/plain" },
    })
  );
});

/* error() - static method that returns an error response
redirect() - returns a response resulting in a redirect to a specified URL 

Body - both requests and responses may have body data; a body is an instance of any of the following types
ArrayBuffer - generic, fixed-length container for binary data 
TypedArray (UintArray and friends) - group of array-like views; each element is a specific numeric type and has a fixed size in bytes
DataView - low-level itnerface for reading and writing multiple number types
Blob - a binary large object, represents immutable raw binary data
File - interface providing information about files and allows JS in a web page to access their contents 
String, or a string literal -
URLSearchParams - utility to help build and manipulate URL query strings
FormData - obejcts that provide a way to easily construct a set of key/value apris representing form fields and their values, which can then be sent using Fetch API 

Request and Response interfaces share these methods to extract a body; these all return a promise that is eventually resolved 
with the actual content

Request.arrayBuffer() / Response.arrayBuffer() - returns a promise that resolves with an ArrayButter, representing the response's body as raw binary data, like files or media streams
Request.blob() / Response.blob() - returns a promise that resolves with a Blob object, representing the response's body as a large amount of raw binary data
Request.formData() / Response.formData() - returns a promise that resolves with a FormData object, alloe easy extraction of form data sent aas `multipart/form-data` from the server
Request.json() / Response.json() - returns a promise that resolves with the result of parsing the response body text as JSON
Request.text() / Response.text() - returns a promise that resolves with a string containing the response's body text

Request bodies can be set by passing body parameters */
const form = new FormData(document.getElementById("login-form"));
fetch("/login", {
  method: "POST",
  body: form,
});

/* Fetch API support can be detected by checking for existence of Headers, Request, Response, or fetch() on the Window or Worker scope */
if (window.fetch) {
  // run my fetch request here
} else {
  // do something with XMLHttpRequest?
}

/* How Fetch API is different from jQuery.ajax() 
- promise returned from fetch() won't reject on HTTP errors even if the response is a HTTP 404 or 500
  instead, as soon as the server responds with headers, the promise with resolve 
  the promise will only reject on network failue or if anything prevented the request from completing 
- unless fetch() is called with the credentials option set to include, fetch()
    won't send cookies in cross-origin requests
    won't set any cookies sent back in cross-origin responses
    */
