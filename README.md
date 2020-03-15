# How to run

**Install dependencies**
```
npm install
```
or 
```
yarn install
```

**Launch the server**

```
npm start
```
or
```
yarn start
```

**Go to `localhost:3000`**

This is the port that is used by default from `config.json`.

**Use endpoints**

`/report` — to get revenue report by label

`/users/:user_id` — to get streaming data for user

# Algorithm

1. Parse user data in a look up hash
2. Parse tracks metadata in a look up hash
3. Go over the streaming data and use the above hashes to get every piece of data together in a single source of truth
4. Calculate total disposable revenue from the users (could probably be part of step 1)
5. Map-reduce our datasource into a hash of label -> seconds streamed. Calculate revenue for each.
6. Do the same for users (again, if we strive for good performance, makes sense to wrap these steps into one)

# Design

### Code organization
Modules are separated by their role. The entry point contains minimum code so that it is easy to deconstruct into separate blocks.
We can also run the report generating script as a completely separate job and run api independently. That way we can reuse our code for a much wider spectrum of scenarios.

### Scalability and performance
We are using streams to read files in chunks. This helps us to not run out of memory once files get huge. We can also improve this approach by storing intermediate values in files/redis/etc. We will lose some performance but our memory consumption will be tolerable and we can recover from where we left off if the process exits for some reason.

### Simplicity and next possible steps

I would probably do this:
1. Write some tests. To do that, some functions (for example, in `parsers.js`) need to know a little bit less about the implementation. For example, `parseUserData` knows that the data comes from a csv file. That means that in order to test it, we actually need to create a csv file. The simplest solution that I see is to pass a stream instead of file path.