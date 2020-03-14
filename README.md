## Short instructions on how to run

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

## Design

Here I'd like to describe how I'd build this app for production:
1. Have a separate script or job to generate the report and save it in a file, redis or whatnot. Currently, we evaluate a report in a lazy manner when it's requested through api, which glues our api and our report generation together. I do believe that we could benefit from running the api and the job independently.
2. For sake of simplicity we store intermediate values in memory, but these can get quite huge in production. Storing intermediate results in a file/redis/.. can help us ensure two things: that we don't run out of memory; that if our job breaks, we can continue from exactly where we were. Of course, it's a huge performance tradeoff but with large amounts of data, it can be justified. Stream protocols can help us with that: they allow to read/write/transform data in small chunks thus keeping the memory usage stable.

## For sake of simplicity

1. The file structure is flat.
2. Function `parseStreamingData` is dependent on the implementation of stream reading library. Generators could provide a good abstraction for this: instead, we could provide an argument like `getNextStreamingRow: function`
3. The whole concept of streaming here is only a half measure, because we store everything in memory anyway.
