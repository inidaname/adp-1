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
let page; 
router("/", ()=> page = Index )
router("/structure", ()=> page = Structure );
router("/constitution", ()=> page = Constitution );
router("/about", ()=> page = About );
router("/register", ()=> page = Register );
router("/candidates", ()=> page = Candidates );
router("/contact", ()=> page = Contact );

router.start({
    hashbang:true
})


</script>
<NavBar />
<main>
    <svelte:component this={page}/>
</main>

<Footer />