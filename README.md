# TypeGraphql-TypeOrm

reproduction and modified to my understanding from examples... credit goes to:

<br>benawad -- typegraphql series </br>
<br>balyaak -- create typegraphql </br>
<br>michael lytek -- typegraphql examples </br>

<br>thanks for the free tuts.. making dev experience a breeze... :)</br>

<br> </br>
<br>Featuring: </br>

1. Register User
2. Standard Login (manually typed password)
3. Redis Cache for session id, recipes query
4. Logging using Winston and Morgan
5. Using Sessions and Cookie Destroy with Express JS
6. Single Session only
   ( users only allowed per session per login -- automatically logged out on the other device if not logged out previously )
7. CRUD -- User, Recipe, Profile
8. Image Upload & imgUrl ( utilising Express Static Path and Graphqlupload )
9. Search Utility (search keywords on your entities), eg. recipe, profile, user

<br>In Progress: </br>

1. Folders of Images (Gallery) -- CRUD
2. Add TODO

<br>Pending: </br>

1. Dashboard
2. SlackClone
3. Google Strategy With Passport JS

<br> </br>
<br> Frontend React-App demo can be seen @the address below ::</br>
https://lucid-meitner-cf95bf.netlify.app/
<br>note: this free service does not accept uploaded image object.. so .. no images can be served</br>

<br> GraphQL Playground demo can be seen @the address below ::</br>
https://young-ocean-04853.herokuapp.com/graphql

<br> </br>
For a good start example,
<br> Paste the queries below to the left side (one by one) and click prettify after that and see the result on the right side </br>

mutation {
login(email: "peter.liu@upfg.com.au", password: "peter.liu") {
errors {
path
message
}
userRole
sessionId
}
}

query {
users {
fullname
email
serverRole
clientRole
loggedInStatus
}
}

<br> </br>
Note: Testing phase with jest is yet to be integrated.. test it on your own time if you copy paste this git
<br> </br>

<img src=https://github.com/plauw79/TypeGraphQL-And-TypeORM/blob/heroku/spideyweb.png>

<br> </br>
By: Peter Liu, with hopefully future peter.liu@cloudbytes.co.sg @copyright reserved 2020

PRO reality conscious, WYSYWIG -- what you see is what you get !!!
