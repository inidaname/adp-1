<script>
import Index from "./pages/Index.svelte";
import Structure from "./pages/Structure.svelte"
import NavBar from "./components/Navbar/Navbar.svelte"
import router from "page";
import Constitution from "./pages/Constitution.svelte";
import About from "./pages/About.svelte";
import Register from "./pages/Register.svelte";
import Candidates from "./pages/Candidates.svelte";
import Contact from "./pages/Contact.svelte";
import Footer from "./components/Footer/Footer.svelte";
import Login from "./pages/Login.svelte";
import {Route} from "tinro"
import Manifesto from "./pages/Manifesto.svelte";
let page; 
let activePage;
let segment;
// router("/", ()=>{ page = Index; 
//     // activePage="current"
//     segment = undefined
    
// });
// router("/structure", ()=> {page = Structure;
//     // activePage="current"
//     segment= "structure"
// } );
// router("/constitution", ()=> {page = Constitution; 
//     // activePage="current"
//     segment="constitution"
// } );
// router("/about", ()=> {page = About ; 
//     // activePage="current"
//     segment ="about"
// });
// router("/register", ()=> {page = Register; 
//     // activePage="current"
//     segment ="register"
// } );
// router("/candidates", ()=> {page = Candidates; 
//     // activePage="current"
//     segment ="candidate"
//  });
// router("/contact", ()=> {page = Contact; 
//     // activePage="current"
//     segment = "contact"
// } );
// router("/login", ()=>{page = Login; 
//     // activePage="current"
// })
// router.start({
//     hashbang:true
// })


</script>

<NavBar {segment} />
<main class=" overflow-x-hidden pt-9">
    <!-- <svelte:component this={page}/> -->
    <Route path="/" >
    <Index />
    </Route>
    <Route path="/about">
    <About/>
    </Route>
    <Route path="/constitution">
    <Constitution/>
    </Route>
    <Route path="/structure">
    <Structure/>
    </Route>
    <Route path="/register">
    <Register/>
    </Route>
    <Route path="/candidates">
    <Candidates/>
    </Route>
    <Route path="/login">
    <Login/>
    </Route>
    <Route path="/contact">
    <Contact/>
    </Route>
    <Route path="/manifesto">
    <Manifesto/>
    </Route>
</main>

<Footer />