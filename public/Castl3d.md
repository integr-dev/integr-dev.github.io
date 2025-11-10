# Castl3d

## Overview
Castl3d is a chess application with a Spring boot backend and a simple react frontend.

## Features
- **EasyDefaultBot**: A simple bot implementation that makes random moves and captures pieces when possible.
- **ChessBoard Management**: Handles the state and operations of the chessboard.
- **Game Management**: Manages game sessions, player turns, and game rules.
- **Bot Integration**: Easily create and integrate custom bots using the provided Bot interface.
- **Movement Validation**: Moves are validated on the client, for faster response times, but also on the server for security.

## Creating a bot
To create a bot, head over to the backend side. Bots are fully managed on the backend and dynamically updated on the frontend.