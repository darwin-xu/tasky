import React, { useState } from 'react'
import { CssBaseline, AppBar, Toolbar, Button } from '@mui/material'
import Canvas from './components/Canvas'

export default function App() {
  return (
    <>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar>
          <Button color="inherit">Create Task</Button>
          <Button color="inherit">Configuration</Button>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Canvas />
    </>
  )
}
