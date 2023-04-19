import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";

export default function TicketCard(props) {
  const [numVotes, setNumVotes] = useState(0);
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader title={props.name} />
      {/* <CardMedia
        component="img"
        height="194"
        // image={props.eventImage}
        alt="NFT name"
      /> */}
      <CardActions disableSpacing>
        <IconButton aria-label="Vote">Vote</IconButton>
      </CardActions>
    </Card>
  );
}
