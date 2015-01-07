This is here because I don't know how to define mongo schemas for validation,
and json doesn't allow comments for some reason.
All of the seed data uses the deadly sins hosts, which have a corresponding
servername textfile here for dev work.

Current holds the last seen state of each host:
```json
{
  "hostname": "string",
  "physical": "boolean",
  "userCount": "int",
  "updated": "date",
  "loadAverage": "float",
  "users": [
    {
      "name": "string",
      "tty": "string",
      "from": "string",
      "loginTime": "date"
    }
  ]
}
```
`userCount` should be the length of the users list, which does not include duplicates.
`physical` could be calculated later by filtering across `users`, but this
will let us select over it.
Storing multiple `users` with the same name will be confusing, so we should
try to keep only the longest running session per user/machine pair.


Session holds a doc for each recorded user session":
```json
{
  "name": "string",
  "hostname": "string",
  "from": "string",
  "loginTime": "date",
  "logoutTime": "date",
  "physical": "boolean"
}
```
As with before, `physical` could be extracted from `from`, but having it is nice.
