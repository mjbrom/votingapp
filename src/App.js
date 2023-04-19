import React, { useState, useEffect } from "react";
import "./App.css";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import { ref, get, child, update } from "firebase/database";
import { database } from "./firebase";
import axios from "axios";
function App() {
  const [numVotes, setNumVotes] = useState(3);
  const [topThree, setTopThree] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [ipDetails, setIpDetails] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getTeams();
      setDisplayList(data);
    };
    const getIPv6 = function (req, res, next) {
      axios.get("https://ipapi.co/json/").then((res) => {
        setIpDetails(res.data);
        console.log(res.data);
      });
    };

    fetchData();
    getIPv6();
  }, []);

  const getTeams = async () => {
    const teams = [];
    const dbRef = ref(database);
    for (let i = 1; i < 5; i++) {
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

  const handleVote = async (e) => {
    const dbRef = ref(database);
    const updates = {};
    let newList = JSON.parse(JSON.stringify(displayList));
    console.log(newList);
    newList.map(async (team) => {
      if (team.id == e.target.id) {
        if (numVotes === 1) {
          team.votes += 1;
        } else {
          team.votes += numVotes;
        }
        updates[`teamInfo/${team.id}/votes`] = team.votes;
        await update(dbRef, updates);

        e.target.disabled = true;
      }
    });
    setDisplayList(newList);
    setNumVotes(numVotes - 1);
    if (numVotes === 1) {
      setTopThree(getTopThree(newList));
    }
  };

  const getTopThree = (newList) => {
    // let teams;
    // const fetchData = async () => {
    //   teams = await getTeams();
    // };
    // fetchData();
    // console.log(teams);
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
  if (numVotes === 0) {
    console.log(topThree);

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
          <Grid container spacing={4}>
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
            Sponsored by NFTicket
          </h2>
        </div>
        <h2 id="aboutSection">
          {" "}
          Vote for the top 3 projects. The first vote is worth 3 points, the
          second is worth 2 points, and the third is worth 1 point.
        </h2>

        <h1 id="votesRemaining">Votes Remaining: {numVotes} </h1>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}></Box>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "50px",
          }}
        >
          <Grid container spacing={4}>
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
                        <Card id="cardProject" sx={{ maxWidth: 345 }}>
                          <CardHeader title={team.name} />
                          <CardActions disableSpacing>
                            <IconButton
                              id={team.id}
                              disabled={numVotes === 0}
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
                })}
          </Grid>
        </Box>
      </div>
    );
  }
}

export default App;
