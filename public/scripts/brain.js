document.addEventListener("DOMContentLoaded", async () => {
    const brainContainer = document.getElementById("brain_container");

    console.log("Brain container:", brainContainer);

    // Initialize Mermaid
    mermaid.initialize({
        startOnLoad: true,
        theme: "dark",
        themeVariables: {
            primaryColor: "#61dafb",
            primaryTextColor: "#fff",
            primaryBorderColor: "#61dafb",
            lineColor: "#61dafb",
            secondaryColor: "#0a0a1f",
            tertiaryColor: "#1e1e3f",
        },
        flowchart: {
            nodeSpacing: 80,
            rankSpacing: 100,
            curve: "basis",
            htmlLabels: true,
            padding: 30,
        },
    });

    const chartDefinition = `
        graph LR
        subgraph Input ["Input Layer"]
            User((👤 User))
            Interface[Interface]
            NLP[NLP Processor]
        end

        subgraph Core ["Core Processing"]
            Manager["🧠 Task Manager"]
        end

        subgraph Search ["Search Systems"]
            SearchRouter["🔍 Search Router"]
            Google["Google"]
            DuckDuckGo["DuckDuckGo"]
            Twitter["Twitter"]
            Telegram["Telegram"]
        end

        subgraph Blockchain ["Blockchain Systems"]
            BlockchainRouter["⛓️ Blockchain Router"]
            TokenAgent["Token Agent"]
            WalletManager["💰 Wallet Manager"]
        end

        subgraph Trading ["Trading Systems"]
            MarketAnalyzer["📊 Market Analyzer"]
            TradingEngine["🚀 Trading Engine"]
            OrderExecutor["Order Executor"]
            RiskManager["⚠️ Risk Manager"]
            StrategyOptimizer["Strategy Optimizer"]
            PortfolioManager["Portfolio Manager"]
        end

        subgraph Output ["Output Processing"]
            ResultAggregator["📥 Result Aggregator"]
            ResponseGenerator["Response Generator"]
            FeedbackAnalyzer["Feedback Analyzer"]
        end

        %% Connections
        User --> Interface
        Interface --> NLP
        NLP --> Manager

        Manager --> SearchRouter
        Manager --> BlockchainRouter
        Manager --> MarketAnalyzer
        Manager --> TradingEngine
        Manager --> WalletManager

        SearchRouter --> Google & DuckDuckGo & Twitter & Telegram

        BlockchainRouter --> TokenAgent
        MarketAnalyzer --> TradingEngine

        TradingEngine --> OrderExecutor & RiskManager & StrategyOptimizer & PortfolioManager

        OrderExecutor & RiskManager & StrategyOptimizer & PortfolioManager --> ResultAggregator
        Google & DuckDuckGo & Twitter & Telegram --> ResultAggregator
        TokenAgent & WalletManager --> ResultAggregator

        ResultAggregator --> ResponseGenerator
        ResponseGenerator --> Interface
        Interface --> User

        User --> FeedbackAnalyzer
        FeedbackAnalyzer --> Manager
    `;

    const { svg } = await mermaid.render("mermaid-svg", chartDefinition);
    brainContainer.innerHTML = svg;

    const svgElement = d3.select("#mermaid-svg");
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .translateExtent([[-500, -500], [5000, 5000]])
        .on("zoom", (event) => { svgElement.select("g").attr("transform", event.transform); });

    const svgRoot = svgElement.select("g");
    if (svgRoot.empty()) {
        const wrapperGroup = svgElement.append("g");
        wrapperGroup.append(() => svgElement.node().firstElementChild);
    }

    d3.select("svg")
        .call(zoom)
        .on("dblclick.zoom", null);

    console.log("D3.js panning and zooming initialized");
});
