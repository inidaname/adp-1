<script>
  import Index from "./pages/Index.svelte";
  import Structure from "./pages/Structure.svelte";
  import NavBar from "./components/Navbar/Navbar.svelte";
  import About from "./pages/About.svelte";
  import Register from "./pages/Register.svelte";
  import Candidates from "./pages/Candidates.svelte";
  import Contact from "./pages/Contact.svelte";
  import Footer from "./components/Footer/Footer.svelte";
  import Login from "./pages/Login.svelte";
  import Downloads from "./pages/Downloads.svelte";
  import { Route, router } from "tinro";
  import Transition from "./components/Transitions/Transition.svelte";
  router.mode.hash();
  router.subscribe((_) => window.scrollTo(0, 0));
</script>

<NavBar />
<main class=" overflow-x-hidden pt-9">
  <!-- <svelte:component this={page}/> -->

  <Transition>
    <Route path="/">
      <Index />
    </Route>
    <Route path="/about">
      <About />
    </Route>

    <Route path="/structure">
      <Structure />
    </Route>
    <Route path="/register">
      <Register />
    </Route>
    <Route path="/candidates">
      <Candidates />
    </Route>
    <Route path="/login">
      <Login />
    </Route>
    <Route path="/contact">
      <Contact />
    </Route>

    <Route path="/downloads">
      <Downloads />
    </Route>
  </Transition>
</main>

<Footer />
