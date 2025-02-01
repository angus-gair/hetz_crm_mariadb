import React from "react";
import { Route, Switch } from "wouter";
import { Navbar } from "./components/layout/Navbar";
import { Home } from "./pages/Home";
import { AboutUs } from "./pages/AboutUs";

export const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={AboutUs} />
      </Switch>
    </div>
  );
};
