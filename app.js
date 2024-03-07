const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'covid19India.db')
const app = express()

const initializationDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Is Running At http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initializationDBAndServer()

//1
app.get('/states/', async (request, response) => {
  const sqlQuery = `
    SELECT 
      * 
    FROM 
      State`
  const toChange = dbObject => {
    return {
      stateId: dbObject.state_id,
      stateName: dbObject.stateName,
      population: dbObject.population,
    }
  }
  const getState = await db.all(sqlQuery)
  response.send(getState.map(eachState => toChange(eachState)))
})

//2
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const sqlQuery = `
  SELECT   
    *
  FROM 
    State 
  WHERE 
    state_id=${stateId}`
  const toChange = stateObject => {
    return {
      stateId: stateObject.state_id,
      stateName: stateObject.state_name,
      population: stateObject.population,
    }
  }
  const getState = await db.get(sqlQuery)
  response.send(toChange(getState))
})

//3
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const sqlQuerys = `
  INSERT INTO 
    District(district_name, state_id, cases, cured, active, death)
  VALUES (
    '${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
  )`
  await db.run(sqlQuerys)
  response.send('District Successfully Added')
})

//4
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getOneDistrict = `
  SELECT 
    * 
  FROM 
    district 
  WHERE 
    district_id=${districtId}`
  const toChange = dbObject => {
    return {
      districtId: dbObject.district_id,
      districtName: dbObject.district_name,
      stateId: dbObject.state_id,
      cases: dbObject.cases,
      cured: dbObject.cured,
      active: dbObject.active,
      deaths: dbObject.deaths,
    }
  }
  const result = await db.get(getOneDistrict)
  response.send(toChange(result))
})

//5
app.delete('/districts/:districtId', async (request, response) => {
  const {districtId} = request.params
  const deleteSqlQuery = `
  DELETE FROM 
    district
  WHERE 
    district_id=${districtId} `
  await db.run(deleteSqlQuery)
  response.send('District Removed')
})

//6
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updatedSqlQuery = `
   UPDATE
    district
  SET
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active}, 
    deaths = ${deaths}
  WHERE
    district_id = ${districtId};
  `
  await db.run(updatedSqlQuery)
  response.send('District Details Updated')
})

//8
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDetails = `
  SELECT 
    state_id 
  FROM 
    district 
  WHERE 
    district_id=${districtId}`
  const getDistrictId = await db.get(getDetails)
  const getQuery = `SELECT state_name as stateName FROM state WHERE state_id=${getDistrictId.state_id}`
  const result = await db.get(getQuery)
  response.send(result)
})

module.exports = app
