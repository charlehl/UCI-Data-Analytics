import numpy as np
import datetime as dt

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///Resources/hawaii.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save references to each table
Measurement = Base.classes.measurement
Station = Base.classes.station

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes.
    /api/v1.0/precipitation
    /api/v1.0/stations
    /api/v1.0/tobs
    /api/v1.0/<start> and /api/v1.0/<start>/<end>
    """
    
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/precipitation<br/>"
        f"/api/v1.0/stations<br/>"
        f"/api/v1.0/tobs<br/>"
        f"/api/v1.0/start_date<br/>"
        f"/api/v1.0/start_date/end_date"
    )

@app.route("/api/v1.0/precipitation")
def precipitation():
    # Create our session (link) from Python to the DB
    session = Session(engine)
    # Perform a query to retrieve the data and precipitation scores
    past_year_data = session.query(Measurement.date, func.sum(Measurement.prcp)).group_by(Measurement.date).\
                    order_by(Measurement.date.desc()).limit(365).all()
    # Create dict for data
    percip_data = []
    for day_data in past_year_data:
        prcp = {}
        prcp[day_data[0]] = round(day_data[1],2)
        percip_data.append(prcp)
    return jsonify(percip_data)

@app.route("/api/v1.0/stations")
def station():
    # Create our session (link) from Python to the DB
    session = Session(engine)
    # Query Data
    station_data = session.query(Station.station, Station.name, Station.latitude, Station.longitude, Station.elevation).all()
    # Create dict for data 
    station_list = []
    for station in station_data:
        temp = {}
        temp[station[0]] = {"name": station[1],
                            "latitude":station[2],
                            "longitude":station[3],
                            "elevation":station[4]}
        station_list.append(temp)
    return jsonify(station_list)

@app.route("/api/v1.0/tobs")
def tobs():
    # Create our session (link) from Python to the DB
    session = Session(engine)
    # Query Data
    tobs_avg_past_year = session.query(Measurement.date, func.avg(Measurement.tobs)).group_by(Measurement.date).\
                order_by(Measurement.date.desc()).limit(365).all()
    # Create dict for data 
    tobs_data = []
    for day_data in tobs_avg_past_year:
        tobs = {}
        tobs[day_data[0]] = round(day_data[1],2)
        tobs_data.append(tobs)
    return jsonify(tobs_data)

@app.route("/api/v1.0/<start>")
def calc_temps_start(start):
    session = Session(engine)

    # Convert to datetime type
    start_date = dt.datetime.strptime(start, "%Y-%m-%d")
    # Query Data
    temps_start = session.query(func.min(Measurement.tobs), func.avg(Measurement.tobs), func.max(Measurement.tobs)).\
        filter(Measurement.date >= start_date).all()
    # Create dict for data
    temp_dict = {"tmin": temps_start[0][0],
                 "tavg": round(temps_start[0][1],2),
                 "tmax": temps_start[0][2]}
    return jsonify(temp_dict)

@app.route("/api/v1.0/<start>/<end>")
def calc_temps_start_end(start, end):
    session = Session(engine)
    
    # Convert to datetime type
    start_date = dt.datetime.strptime(start, "%Y-%m-%d")
    end_date = dt.datetime.strptime(end, "%Y-%m-%d")
    # Query Data
    temp_start_end = session.query(func.min(Measurement.tobs), func.avg(Measurement.tobs), func.max(Measurement.tobs)).\
        filter(Measurement.date >= start_date).filter(Measurement.date <= end_date).all()
    
    # Create dict for data
    temp_dict = {"tmin": temp_start_end[0][0],
                 "tavg": round(temp_start_end[0][1],2),
                 "tmax": temp_start_end[0][2]}
    return jsonify(temp_dict)

if __name__ == '__main__':
    app.run(debug=True)