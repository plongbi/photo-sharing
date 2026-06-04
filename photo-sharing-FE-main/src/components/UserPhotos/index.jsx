import React, { useState, useEffect } from "react";

import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Box,
  TextField,
} from "@material-ui/core";

import { useParams, useNavigate, Link } from "react-router-dom";

import axios from "axios";
import fetchModel, { BASE_URL } from "../../lib/fetchModelData";

function UserPhotos({ advancedFeatures }) {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState(null);
  const [comment, setComment] = useState("");

  const fetchPhotos = async () => {
    try {
      const data = await fetchModel(`/photosOfUser/${userId}`);
      setPhotos(data);
    } catch {
      setPhotos([]);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [userId]);

  useEffect(() => {
    if (advancedFeatures && photos?.length > 0 && !photoId) {
      navigate(`/photos/${userId}/${photos[0]._id}`, {
        replace: true,
      });
    }
  }, [advancedFeatures, photos, photoId, navigate, userId]);

  const handleComment = async (photoId) => {
    if (!comment.trim()) {
      return alert("Comment cannot be empty");
    }

    try {
      await axios.post(
        `${BASE_URL}/commentsOfPhoto/${photoId}`,
        { comment },
        {
          withCredentials: true,
        }
      );

      setComment("");
      fetchPhotos();
    } catch {
      alert("Add comment failed");
    }
  };

  if (photos === null) {
    return <Typography>Loading...</Typography>;
  }

  if (photos.length === 0) {
    return <Typography>No photos.</Typography>;
  }

  const renderPhoto = (photo) => (
    <Card key={photo._id} style={{ marginBottom: 30 }}>
      <CardMedia
        component="img"
        image={`${BASE_URL}/images/${photo.file_name}`}
        alt="photo"
        style={{
          maxHeight: 500,
          objectFit: "contain",
        }}
      />

      <CardContent>
        <Typography variant="body2" color="textSecondary">
          Posted: {photo.date_time}
        </Typography>

        <Typography variant="subtitle1" style={{ marginTop: 10 }}>
          Comments:
        </Typography>

        {photo.comments?.length > 0 ? (
          photo.comments.map((c) => (
            <Box key={c._id} my={1}>
              <Typography
                variant="body2"
                color="primary"
                component={Link}
                to={`/users/${c.user._id}`}
                style={{
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                {c.user.first_name} {c.user.last_name}:
              </Typography>

              <Typography variant="body2" component="span">
                {" "}
                {c.comment}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>No comments.</Typography>
        )}

        <Box mt={3}>
          <TextField
            fullWidth
            label="Add Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button
            style={{ marginTop: 10 }}
            variant="contained"
            color="primary"
            onClick={() => handleComment(photo._id)}
          >
            Add Comment
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (advancedFeatures) {
    let currentIndex = photos.findIndex((p) => p._id === photoId);

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    const currentPhoto = photos[currentIndex];

    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6" gutterBottom>
          Photo {currentIndex + 1} of {photos.length}
        </Typography>

        <div style={{ width: "100%", maxWidth: 600 }}>
          {renderPhoto(currentPhoto)}
        </div>

        <Box display="flex" style={{ gap: 16 }}>
          <Button
            variant="contained"
            color="primary"
            disabled={currentIndex === 0}
            onClick={() =>
              navigate(`/photos/${userId}/${photos[currentIndex - 1]._id}`)
            }
          >
            Previous
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={currentIndex === photos.length - 1}
            onClick={() =>
              navigate(`/photos/${userId}/${photos[currentIndex + 1]._id}`)
            }
          >
            Next
          </Button>
        </Box>
      </Box>
    );
  }

  return <div>{photos.map(renderPhoto)}</div>;
}

export default UserPhotos;
