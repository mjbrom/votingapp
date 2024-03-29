import React, { useState, useEffect } from "react";
import "./App.css";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import { ref, get, child, update, set } from "firebase/database";
import { database } from "./firebase";
import axios from "axios";
import { Button } from "@mui/material";
import Typography from "@mui/material/Typography";

function App() {
  const [numVotes, setNumVotes] = useState(3);
  const [topThree, setTopThree] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [ipDetails, setIpDetails] = useState("");
  const [rawIP, setRawIP] = useState("");
  const [checkHasVoted, setCheckHasVoted] = useState(false);

  useEffect(() => {
    const getUsedIP = async () => {
      const dbRef = ref(database);
      let ipVal = await getIPv6();
      await get(child(dbRef, `ipStorage/`)).then((snapshot) => {
        if (snapshot.exists()) {
          if (Object.values(snapshot.val()).indexOf(ipVal) > -1) {
            setHasVoted(true);
          }
        } else {
          console.log("No Data");
        }
      });
      // console.log(result);
      // return result;
    };
    const fetchData = async () => {
      const data = await getTeams();
      setDisplayList(data);
    };
    const getIPv6 = async function (req, res, next) {
      return axios.get("https://ipapi.co/json/").then(async (res) => {
        // let ipList = await getUsedIP();
        // console.log(ipList);
        setRawIP(res.data.ip);
        let newIP = res.data.ip;
        newIP = newIP.split(".").join("");
        newIP = newIP.split("#").join("");
        newIP = newIP.split("$").join("");
        newIP = newIP.split("[").join("");
        newIP = newIP.split("]").join("");
        setIpDetails(newIP);
        console.log(res.data);
        return res.data.ip;
      });
    };
    // getUsedIP();
    getUsedIP();
    fetchData();
  }, []);

  const getTeams = async () => {
    const teams = [];
    const dbRef = ref(database);
    for (let i = 1; i < 19; i++) {
      await get(child(dbRef, `teamInfo/${i}`)).then((snapshot) => {
        if (snapshot.exists()) {
          teams.push(snapshot.val());
        } else {
          console.log("No data available");
        }
      });
    }
    console.log(teams);
    return teams;
  };

  const handleSubmit = async (e) => {
    if (hasVoted === true) {
      setCheckHasVoted(true);
      return null;
    } else {
      setSubmitClicked(true);
      const dbRef = ref(database);
      const updates = {};
      const ipDbRef = ref(database, "ipStorage/" + ipDetails);
      set(ipDbRef, rawIP);
      displayList.map(async (team) => {
        updates[`teamInfo/${team.id}/votes`] = team.votes;
        await update(dbRef, updates);
      });
      setTopThree(getTopThree(displayList));
    }
  };

  const handleVote = async (e) => {
    if (numVotes > 0 || e.target.innerText === "Unvote") {
      let newList = JSON.parse(JSON.stringify(displayList));
      console.log(e);
      newList.map(async (team) => {
        // eslint-disable-next-line eqeqeq
        if (team.id == e.target.id) {
          if (e.target.innerText === "Unvote") {
            team.votes -= 1;
            setNumVotes(numVotes + 1);
            e.target.innerText = "Vote";
            document.getElementById(e.target.id).style.backgroundColor = "grey";
          } else {
            team.votes += 1;
            setNumVotes(numVotes - 1);
            e.target.innerText = "Unvote";
            document.getElementById(e.target.id).style.backgroundColor =
              "green";
          }
        }
      });
      setDisplayList(newList);
    }
  };

  const getTopThree = (newList) => {
    let first = Number.MIN_VALUE;
    let firstName = "";
    let second = Number.MIN_VALUE;
    let secondName = "";
    let third = Number.MIN_VALUE;
    let thirdName = "";
    for (let i = 0; i < newList.length; i++) {
      if (newList[i]?.votes > first) {
        third = second;
        thirdName = secondName;
        second = first;
        secondName = firstName;
        first = newList[i]?.votes;
        firstName = newList[i]?.name;
      } else if (newList[i]?.votes > second) {
        third = second;
        thirdName = secondName;
        second = newList[i]?.votes;
        secondName = newList[i]?.name;
      } else if (newList[i]?.votes > third) {
        third = newList[i]?.votes;
        thirdName = newList[i]?.name;
      }
    }
    return [
      { name: firstName, votes: first },
      { name: secondName, votes: second },
      { name: thirdName, votes: third },
    ];
  };
  if (checkHasVoted === true) {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div>
          <h1>No Voting Twice!</h1>
        </div>

        <img src={require("./nonono2.gif")} alt="loading..." />
      </div>
    );
  } else {
    if (submitClicked === true) {
      return (
        <div className="App-header">
          <h1>Thank you for voting!</h1>
          <h3>Here are the top 3 projects right now</h3>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}></Box>
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "50px",
            }}
          >
            <Grid id="mainGrid" container spacing={4}>
              {!topThree?.length
                ? "No Teams available at this time"
                : topThree.map((team) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          margin: "20px",
                        }}
                      >
                        <Card id="cardProjectFinal" sx={{ maxWidth: 345 }}>
                          <CardHeader title={team.name} />
                          <CardActions disableSpacing>
                            <IconButton
                              disabled={true}
                              aria-label="Vote"
                              onClick={(e) => handleVote(e)}
                            >
                              Votes: {team.votes}
                            </IconButton>
                          </CardActions>
                        </Card>
                      </div>
                    );
                  })}
            </Grid>
          </Box>
        </div>
      );
    } else {
      return (
        <div className="App">
          <div className="titleHeader">
            <h1 id="title" style={{ color: "white" }}>
              Modern Marvels Voting
            </h1>
            <h2 id="sponsortitle" style={{ color: "white" }}>
              Created by NFTicket
            </h2>
          </div>
          <h2 id="aboutSection">
            {" "}
            Vote for the top 3 projects and then hit Submit. Each vote is worth
            1 point.
          </h2>

          <h1 id="votesRemaining">
            Votes Remaining: {numVotes ? numVotes : "0"}{" "}
          </h1>

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}></Box>
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "50px",
            }}
          >
            <Grid id="mainGrid" container spacing={4}>
              {!displayList?.length
                ? "No Teams available at this time"
                : displayList.map((team) => {
                    if (team !== null) {
                      return (
                        <div
                          style={{
                            display: "flex",
                            margin: "20px",
                          }}
                          key={team.id}
                        >
                          <Card
                            id={team.id}
                            sx={{ maxWidth: 345 }}
                            style={{
                              backgroundColor: "grey",
                              borderRadius: "25px",
                              opacity: 0.8,
                              minHeight: "20vh",
                              width: "400px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "times new roman",
                              color: "white",
                              fontSize: "20px",
                            }}
                          >
                            <Typography
                              sx={{ fontSize: 14, color: "white" }}
                              color="text.secondary"
                              gutterBottom
                            >
                              {team.name} (Team {team.id})
                            </Typography>
                            <CardHeader title={team.projName} />
                            <Typography
                              sx={{ mb: 1.5, color: "white" }}
                              color="text.secondary"
                            >
                              {team.members}
                            </Typography>
                            <CardActions disableSpacing>
                              <IconButton
                                id={team.id}
                                // disabled={numVotes === 0}
                                aria-label="Vote"
                                onClick={(e) => handleVote(e)}
                              >
                                Vote
                              </IconButton>
                            </CardActions>
                          </Card>
                        </div>
                      );
                    }
                    return null;
                  })}
            </Grid>
          </Box>

          <Button
            disabled={numVotes !== 0}
            variant="contained"
            id="submitButton"
            onClick={() => handleSubmit()}
          >
            Submit
          </Button>
        </div>
      );
    }
  }
}

export default App;
