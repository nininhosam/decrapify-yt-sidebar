const subscriptionText = ["subscriptions", "inscrições"];
const youText = ["you", "você"];
const homeText = ["home", "início"];

let timeout = null;

function debounce(fn, delay = 200) {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
}

function insertCustomSidebarButton(afterNode) {
  const btn = document.createElement("a");
  btn.href = "/feed/subscriptions";
  btn.className = "decrapify-custom-btn";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.classList.add("decrapify-custom-icon");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M18 1H6a2 2 0 00-2 2h16a2 2 0 00-2-2Zm3 4H3a2 2 0 00-2 2v13a2 2 0 002 2h18a2 2 0 002-2V7a2 2 0 00-2-2ZM3 20V7h18v13H3Zm13-6.5L10 10v7l6-3.5Z");
  svg.appendChild(path);

  const label = document.createElement("span");
  label.className = "decrapify-custom-text";
  label.textContent = "Subscriptions";

  btn.appendChild(svg);
  btn.appendChild(label);

  afterNode.after(btn);
}

function insertCustomStyle(){
    const style = document.createElement("style");
    style.textContent = `
    .decrapify-custom-btn {
        display: flex; 
        align-items: center; 
        gap: 2.5rem;
        padding: 8px, 0px;
        color: var(--yt-spec-text-primary, #fff); 
        text-decoration: none;
        width: calc(100% - 12px);
        min-height: 40px;
        border-radius: 12px;
    }
    .decrapify-custom-btn:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    .decrapify-custom-icon {
        width: 24px; 
        height: 24px; 
        fill: currentColor; 
        flex-shrink: 0;
        margin-left: 12px;
    }
    .decrapify-custom-text {
        white-space: nowrap; 
        font-size: 1.4rem;
    }
    `;
    document.documentElement.appendChild(style);
}


const observer = new MutationObserver(onDomChanged);

observer.observe(document.body, {
    childList: true,
    subtree: true
});


function onDomChanged() {
    debounce(() => {
        const sidebarSections = document.querySelectorAll("ytd-guide-section-renderer");
        let foundSubscriptionSection = null;
        let foundYouSection = null;
        let foundHomeSection = null;


        for (const sidebarSection of sidebarSections) {
            const simpleSectionItems = sidebarSection.querySelectorAll("div#items ytd-guide-entry-renderer");
            const sectionItems = sidebarSection.querySelectorAll("div#items ytd-guide-collapsible-section-entry-renderer");
            
            if (sectionItems.length > 0){
                let title = sectionItems[0]
                .querySelector("div#header ytd-guide-entry-renderer a#endpoint tp-yt-paper-item yt-formatted-string")
                .innerText.toLowerCase();
                
                // Finds the Subscription section (to swap)
                if (subscriptionText.includes(title)) foundSubscriptionSection = sidebarSection;
                // Finds the You section (to swap)
                if (youText.includes(title)) foundYouSection = sidebarSection;
            }
            
            // Finds the Home section (to add 'subscriptions' button back)
            if (simpleSectionItems.length > 0 && 
                homeText.includes(
                    simpleSectionItems[0]
                    .querySelector("a#endpoint tp-yt-paper-item yt-formatted-string")
                    .innerText.toLowerCase()
                )){
                foundHomeSection = sidebarSection;
            }
        }

        // Swaps 'You' and 'Subscriptions' sections
        if (foundYouSection && foundSubscriptionSection){
            let sidebar = foundYouSection.parentElement
            sidebar.insertBefore(foundYouSection, foundSubscriptionSection);
            observer.disconnect();
        }

        // Adds 'Subscriptions' button back
        if (foundHomeSection){
            let homeButtons = foundHomeSection.querySelectorAll("div#items ytd-guide-entry-renderer");
            let hasSubscriptionsButton = [...homeButtons].some(x =>
                subscriptionText.includes(
                    x.querySelector("a#endpoint tp-yt-paper-item yt-formatted-string").innerText.toLowerCase()
                ));

            if(!hasSubscriptionsButton) {
                insertCustomStyle();
                insertCustomSidebarButton(homeButtons[0]);
            };
        }
    });
}

onDomChanged();

