document.addEventListener('DOMContentLoaded', function () { console.log('global.js loaded...'); buyOnClick(); });
document.addEventListener("visibilitychange", detectPageFocus);
window.addEventListener('scroll', () => { topScroll(); });
window.addEventListener('load', () => { parallax(); menuControls(); fadeInOnScroll(); });
let pageFocused = true;
//// 
// Wallet Connection
let isConnected = false;
let connectedWallet = null;
//
////
// Chain
const chainID = "0x2105";
const chainName = "Base Mainnet";
//
////
// Interface
const loaderHTML = `<div class="loader"></div>`;
const cancelIcon = `<i class="fa-solid fa-ban"></i>`;
const processIcon = `<img src="assets/img/recycle.svg"></img>`;
const mainMenu = document.getElementById("main_menu");
const tokenPrice = document.getElementById("token_price");
const walletBalanace = document.getElementById("wallet_balance");
const walletBalanceUSD = document.getElementById("wallet_balance_usd");
//// 
// Root
const root = document.documentElement;
const header = document.querySelector('header');
const nav = document.getElementById('nav');
const navContainer = document.getElementById('nav_container');
//
////
// Buttons
const connectButton = document.getElementById("connect_button");
const buyButton = document.getElementById("buy_button");
//
////
// Containers
const mainSection = document.getElementById("main_section");
//
//// 
// Contracts
let currentETHPrice = null;
let currentTokenPriceVirtuals = null;
let currentTokenPrice = null;
let currentTokenBalance = null;
let lastVisitTokenPrice = null;
const ca = "0xf3bb8f1dfe1F50679B5F76a11B3EF1B35282774c";
const chainlinkETH = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
const virtualsCA = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";
const virtualsLP = "0xE31c372a7Af875b3B5E0F3713B17ef51556da667";
const wethAddress = "0x4200000000000000000000000000000000000006";
const steadyShellyInfo = {
    creator: "0x89c360c53b42c846acD66E74082BaFb51a6c00Ca",
    token: "0xf3bb8f1dfe1F50679B5F76a11B3EF1B35282774c",
    pair: "0xbF141Ee9b6a3d13aDc964E1d626Ad812a214C4d5",
    name: "Steady Shelly",
    symbol: "SS",
    decimals: 18,
    price: 0,
    balance: 0,
};
////
//
// Elements
const navHide = '<i class="fa-solid fa-ellipsis-vertical"></i>';
const navShow = '<i class="fa-solid fa-ellipsis"></i>';
const buyLink = 'https://app.virtuals.io/prototypes/0xf3bb8f1dfe1F50679B5F76a11B3EF1B35282774c';
// #region Global Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////
    // #region Truncation
    // This function truncates a string to a specified length
    function truncate(string, startLength = 6, endLength = 4) {
        if (string.length <= startLength + endLength + 3) { // Only truncate if too long
            return string;
        }
        return `${string.slice(0, startLength)}...${string.slice(-endLength)}`;
    }
    //
    function truncateBalance(balance, maxLength = 8) {
        const num = parseFloat(balance);
        if (isNaN(num)) { console.error("Invalid balance:", balance); return balance; }

        if (num >= 1e15) return `${(num / 1e15).toFixed(2)}Q`;
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;

        const [intPart, decPart = ""] = num.toString().split(".");
        if (intPart.length >= maxLength) { return intPart; }

        const remainingLength = maxLength - intPart.length - 1;
        const truncatedDecimal = decPart.slice(0, Math.max(remainingLength, 0));
        return truncatedDecimal ? `${intPart}.${truncatedDecimal}` : intPart;
    }
    //
    function checksumAddress(address) { return ethers.utils.getAddress(address); }
    // #endregion Truncation
//////
    // #region Interface
    function updateElement(element, string) { element.textContent = string; }
    //
    function toggleLoader(element, isEnabled = true, newText = "") {
        if (!element) return;
        if (isEnabled) { element.innerHTML = loaderHTML; } else { element.innerHTML = newText; }
    }
    //
    function detectPageFocus() {
        pageFocused = document.visibilityState === "visible";
        if (pageFocused) console.log(`Page Focused...`); else console.log(`Page Unfocused...`);
    }
    //
    function innerHTML(element, string) { element.innerHTML = string; }
    //
    function parallax() {
        const parallaxElements = document.querySelectorAll('[data-speed]');
    
        function applyParallax() {
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.speed) || 0.5;
                const offset = window.scrollY * speed;
                element.style.transform = `translateY(${-offset}px)`;
            });
        }
        function onScroll() { requestAnimationFrame(applyParallax); }
        window.addEventListener('scroll', onScroll);
        applyParallax();
    }
    //
    function fadeInOnScroll() {
        const elements = document.querySelectorAll('[data-fade]');
        if (elements.length === 0) { return; }
    
        elements.forEach(el => {
            el.style.opacity = 0;
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        });
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                    el.style.opacity = 1;
                    el.style.transform = 'translateY(0)';
                } else {
                    el.style.opacity = 0;
                    el.style.transform = 'translateY(20px)';
                }
            });
        }, { threshold: 0.1 });
    
        elements.forEach(el => observer.observe(el));
    }
    //
    function menuControls() {    
        const navList = document.querySelector('#nav_list');
        
        mainMenu.addEventListener('click', () => { 
            if (navContainer.classList.contains('nav_show')) {
                navContainer.classList.remove('nav_show');
                navContainer.classList.add('nav_hide');
                mainMenu.innerHTML = navHide;
                navList.classList.remove('animate');
            } else {
                navContainer.classList.remove('nav_hide');
                navContainer.classList.add('nav_show');
                mainMenu.innerHTML = navShow;
                
                // Reset animations by removing and re-adding the class
                navList.classList.remove('animate');
                // Force reflow to ensure animation triggers again
                void navList.offsetWidth;
                navList.classList.add('animate');
            }
        });
    }
    //
    function topScroll() {
        if (window.scrollY === 0) {
            header.classList.add('top_header');
        } else {
            header.classList.remove('top_header');
        }
    };
    //
    function populateValues() {
        const formattedBalance = Number(ethers.utils.formatUnits(currentTokenBalance, 18));        
        const priceDiff = checkTokenPriceDifference();
        
        if (priceDiff) {
            if (Math.abs(priceDiff.percentageChange) < 0.001) {
                tokenPrice.innerHTML = `$${currentTokenPrice.toFixed(6)}`;
                walletBalanceUSD.innerHTML = `$${(formattedBalance * currentTokenPrice).toFixed(2)}`;
            } else {
                const arrow = priceDiff.increased ? '▲' : '▼';
                const color = priceDiff.increased ? '#22c55e' : '#ef4444';
                
                tokenPrice.innerHTML = `
                    <span style="color: ${color}">
                        ${arrow}$${currentTokenPrice.toFixed(8)} • ${Math.abs(priceDiff.percentageChange).toFixed(2)}%
                    </span>
                `;
                
                walletBalanceUSD.innerHTML = `
                    <span style="color: ${color}">
                        ${arrow}$${(formattedBalance * currentTokenPrice).toFixed(2)}
                    </span>
                `;
            }
        } else {
            tokenPrice.innerHTML = `$${currentTokenPrice.toFixed(8)}`;
            walletBalanceUSD.innerHTML = `$${(formattedBalance * currentTokenPrice).toFixed(2)}`;
        }
        
        walletBalanace.innerHTML = truncateBalance(formattedBalance);
    }
    // #endregion Interface
////
    // #region Crypto Details
    async function getCryptoDetails() {
        currentTokenBalance = await getTokenBalance();
        await getETHPrice();
      
        currentVirtualsPrice = await getTokenPriceV2(virtualsLP);
        currentTokenPriceVirtuals = await getTokenPriceVirtuals();
        currentTokenPrice = await getTokenPriceUSD();
      
        fetchTokenPriceFromCache();
        cacheTokenPrice();
        populateValues();
    }
    //
    async function getTokenBalance() {
        if (!window.ethereum) { return; }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            const contract = new ethers.Contract(steadyShellyInfo.token, ERC_20, signer);

            const balance = await contract.balanceOf(address);
            console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
            return balance;
        } catch (error) {
            console.error("Error getting token balance:", error);
        }
    }
    //
    async function getETHPrice() {
        if (!window.ethereum) { return; }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const contract = new ethers.Contract(chainlinkETH, CHAINLINK, signer);
            const roundData = await contract.latestRoundData();

            const price = ethers.utils.formatUnits(roundData.answer, 8);
            console.log(`ETH Price: $${price}`);
            return price;
        }catch (error) {
            console.error("Error getting ETH price:", error);
        }
    }
    //
    async function getTokenPriceV2(poolAddress) {
        if (!window.ethereum) { return; }

        try {
            if (currentETHPrice === null) currentETHPrice = await getETHPrice();
            if (!currentETHPrice) return null;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const uniswapV2 = new ethers.Contract(poolAddress, UNISWAP_V2_POOL, signer);

            const token0 = await uniswapV2.token0();
            const token1 = await uniswapV2.token1();

            const reserves = await uniswapV2.getReserves();
            const reserve0 = reserves._reserve0;
            const reserve1 = reserves._reserve1;
            
            const token0Contract = new ethers.Contract(token0, ERC_20, signer);
            const token1Contract = new ethers.Contract(token1, ERC_20, signer);

            const decimals0 = await token0Contract.decimals();
            const decimals1 = await token1Contract.decimals();
    
            console.log("Reserve 0:", reserve0);
            console.log("Reserve 1:", reserve1);
            console.log("Token 0:", token0);
            console.log("Token 1:", token1);
            console.log("Decimals 0:", decimals0);
            console.log("Decimals 1:", decimals1);

            const reserve0BN = ethers.BigNumber.from(reserve0);
            const reserve1BN = ethers.BigNumber.from(reserve1);
    
            // Convert each reserve to a normal floating-point value, adjusting by its decimals
            // e.g. if reserve0 = 123456789 (raw) and decimals0 = 6, then
            // parseFloat(ethers.utils.formatUnits(reserve0BN, 6)) => 123.456789
            const reserve0Float = parseFloat(ethers.utils.formatUnits(reserve0BN, decimals0));
            const reserve1Float = parseFloat(ethers.utils.formatUnits(reserve1BN, decimals1));
    
            let priceInWETH;
            if (token1.toLowerCase() === wethAddress.toLowerCase()) {
                priceInWETH = reserve1Float / reserve0Float; // Price in WETH = (reserve1 / 10^decimals1) / (reserve0 / 10^decimals0)
            } else if (token0.toLowerCase() === wethAddress.toLowerCase()) {
                priceInWETH = reserve0Float / reserve1Float; // Price in WETH = (reserve0 / 10^decimals0) / (reserve1 / 10^decimals1)
            } else {
                console.log(`Skipping pool ${poolAddress} - Neither token is WETH.`);
                return null;
            }
    
            const tokenPriceUSD = priceInWETH * currentETHPrice;
            console.log(`V2 Price for token in pool ${poolAddress}: ${tokenPriceUSD} USD`);
    
            return tokenPriceUSD;
        } catch (error) {
            console.error('Error calculating V2 token price:', error);
            return null;
        }
    }
    //
    async function getTokenPriceVirtuals() {
        if (!window.ethereum) { return; }
    
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
    
            const shellyLPContract = new ethers.Contract(steadyShellyInfo.pair, FPAIR, provider);
    
            const reserves = await shellyLPContract.getReserves();
            const [reserveA, reserveB] = reserves;
            console.log("Reserve A:", reserveA.toString());
            console.log("Reserve B:", reserveB.toString());
    
            const tokenA = await shellyLPContract.tokenA();
            const tokenB = await shellyLPContract.tokenB();
            console.log("Token A:", tokenA);
            console.log("Token B:", tokenB);
            
            if (tokenA !== virtualsCA && tokenB !== virtualsCA) {
                console.log("Skipping pool - Neither token is Virtuals.");
                return null;
            }
    
            const tokenAContract = new ethers.Contract(tokenA, ERC_20, signer);
            const tokenBContract = new ethers.Contract(tokenB, ERC_20, signer);
            const decimalsA = await tokenAContract.decimals();
            const decimalsB = await tokenBContract.decimals();
            console.log("Decimals A:", decimalsA);
            console.log("Decimals B:", decimalsB);
    
            const isTokenAVirtuals = tokenA.toLowerCase() === virtualsCA.toLowerCase();
            const adjustedReserveA = ethers.utils.formatUnits(reserveA, decimalsA);
            const adjustedReserveB = ethers.utils.formatUnits(reserveB, decimalsB);
    
            let shellyPriceInVirtuals;
            if (isTokenAVirtuals) {
                shellyPriceInVirtuals = parseFloat(adjustedReserveA) / parseFloat(adjustedReserveB);
            } else {
                shellyPriceInVirtuals = parseFloat(adjustedReserveB) / parseFloat(adjustedReserveA);
            }
    
            console.log("Token price in Virtuals:", shellyPriceInVirtuals);
            return shellyPriceInVirtuals;
        } catch (error) {
            console.error('Error calculating Virtuals token price:', error);
            return null;
        }
    }
    //
    async function getTokenPriceUSD() {
        try {
            if (!currentTokenPriceVirtuals || !currentVirtualsPrice) { console.log("Missing details..."); return null; }

            const priceInUSD = currentTokenPriceVirtuals * currentVirtualsPrice;
            console.log("Token price in USD:", priceInUSD);
            return priceInUSD;
        } catch (error) {
            console.error('Error calculating USD price:', error);
            return null;
        }
    }
    //
    function buyOnClick() { buyButton.addEventListener('click', () => { window.open(buyLink, '_blank'); }); };
    //
    function cacheTokenPrice() {
        if (currentTokenPrice !== null) {
            localStorage.setItem('lastTokenPrice', currentTokenPrice);
            console.log(`Cached token price: ${currentTokenPrice}`);
        } else { console.log('No token price to cache.'); }
    }
    //
    function fetchTokenPriceFromCache() {
        const cachedPrice = localStorage.getItem('lastTokenPrice');
        if (cachedPrice) {
            lastVisitTokenPrice = cachedPrice;
            console.log(`Fetched token price from cache: ${currentTokenPrice}`);
        } else { console.log('No cached token price found.'); }
    }
    //
    function checkTokenPriceDifference() {
        if (currentTokenPrice === null || lastVisitTokenPrice === null) {
            console.log('Cannot calculate difference - missing price data');
            return null;
        }
    
        const difference = currentTokenPrice - lastVisitTokenPrice;
        const percentageChange = (difference / lastVisitTokenPrice) * 100;
        console.log(`Price difference: ${difference}`);
        console.log(`Percentage change: ${percentageChange}%`);
        
        return {
            difference: difference,
            percentageChange: percentageChange,
            increased: difference > 0
        };
    }
    // #endregion Crypto Details
////
//
// #endregion Global Functions


document.querySelectorAll("#nav_list li").forEach((li) => {
    li.addEventListener("mouseenter", () => {
        // Get the index of the current <li> among other <li>s only
        const liIndex = Array.from(document.querySelectorAll("#nav_list li")).indexOf(li);

        // Determine the target header based on the section
        const targetHeader = liIndex <= 2
            ? document.querySelector("#nav_list h3:nth-of-type(1)") // | Shelly
            : liIndex <= 4
            ? document.querySelector("#nav_list h3:nth-of-type(2)") // | Workshop
            : document.querySelector("#nav_list h3:nth-of-type(3)"); // | Details

        // Add the active class to the header
        if (targetHeader) targetHeader.classList.add("active");
    });

    li.addEventListener("mouseleave", () => {
        document.querySelectorAll("#nav_list h3").forEach((h3) => {
            h3.classList.remove("active");
        });
    });
});
