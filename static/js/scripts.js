

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'awards']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    const attributeBindings = {
        'hero-cta-link': { targetId: 'hero-cta', attr: 'href' },
        'contact-google-scholar-link': { targetId: 'contact-google-scholar', attr: 'href' },
        'contact-cv-link': { targetId: 'contact-cv', attr: 'href' },
        'publications-cta-link': { targetId: 'publications-cta', attr: 'href' }
    };

    const internalKeys = ['email-user', 'email-domain'];

    const renderValue = (value) => {
        if (Array.isArray(value)) {
            return value.map(item => `<span class="badge-pill">${item}</span>`).join('');
        }
        return value;
    };

    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                if (attributeBindings[key]) {
                    const binding = attributeBindings[key];
                    const target = document.getElementById(binding.targetId);
                    if (target) {
                        target.setAttribute(binding.attr, yml[key]);
                    }
                    return;
                }
                if (internalKeys.includes(key)) {
                    return;
                }
                const el = document.getElementById(key);
                if (el) {
                    el.innerHTML = renderValue(yml[key]);
                } else {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString());
                }

            })

            const emailUser = yml['email-user'];
            const emailDomain = yml['email-domain'];
            if (emailUser && emailDomain) {
                const displayText = `${emailUser} [at] ${emailDomain.replace(/\./g, ' dot ')}`;
                const emailAddress = `${emailUser}@${emailDomain}`;
                const emailLink = document.getElementById('contact-email');
                if (emailLink) {
                    emailLink.textContent = displayText;
                    emailLink.setAttribute('href', `mailto:${emailAddress}`);
                }
                const heroCta = document.getElementById('hero-cta');
                if (heroCta && (!yml['hero-cta-link'] || heroCta.getAttribute('href') === '#')) {
                    heroCta.setAttribute('href', `mailto:${emailAddress}`);
                }
            }
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
