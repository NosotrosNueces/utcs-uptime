This is here because I don't know how to define mongo schemas for validation,
and json doesn't allow comments for some reason.
All of the seed data uses the deadly sins hosts, which have a corresponding
servername textfile here for dev work.

Current holds the last seen state of each host:
```json
{
  "hostname": "string",
  "physical": "boolean",
  "user-count": "int",
  "users": [
    {
      "name": "string",
      "tty": "string",
      "from": "string",
      "time": "date"
    }
  ]
}
```
`physical` could be calculated later by filtering across `users`, but this
will let us select over it.
Storing multiple `users` with the same name will be confusing, so we should
try to keep only the longest running session per user/machine pair.


Session holds a doc for each recorded user session":
```json
{
  "username": "string",
  "servername": "string",
  "hostname": "string",
  "time": "date",
  "physical": "boolean"
}
```
`hostname` is carried over from `user[from]` above; we probably shouldn"t do
anything with it, but we have access to it.
As with before, `physical` could be extracted from `hostname`, but having it is nice.
