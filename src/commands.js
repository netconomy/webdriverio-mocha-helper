/**
 * @author <a href="mailto:s.mayer@netconomy.net">Stefan Mayer</a>
 */

export function registerCommands(client) {
    client.addCommand('switchFrame', function switchFrame(iframeSelector) {
        logger.info(`switching to iframe ${iframeSelector}`);
        return this.waitForExist(iframeSelector)
            .element(iframeSelector, (err, res) => {
                if (err) {
                    throw new Error(err);
                }
                return this.frame(res.value);
            });
    });

    client.addCommand('fillForm', function fillForm(formSelector, data, submit) {
        logger.info(`filling form ${formSelector}`);
        return Object.keys(data).reduce((prev, key) => {
            const selector = `${formSelector} [name=${key}]`;
            return prev.isVisibleWithinViewport(selector).then(function scrollIfInvisible(visible) {
                if (!visible) {
                    this.scroll(selector);
                }
                return this;
            }).getTagName(`${formSelector} [name=${key}]`).then(function checkInputTagName(tagName) {
                switch (tagName) {
                    case 'select':
                        return this.getAttribute(`${formSelector} [name=${key}]`, 'class').then(
                            function checkSelectType(classes) {
                                const jQuerySelect = classes.split(' ').filter((className) => {
                                        return className === 'jQueryUISelectmenu';
                                    }).length > 0;
                                if (jQuerySelect) {
                                    return this.selectjQueryUISelect(`${formSelector} [name=${key}]`, data[key]);
                                }
                                return this.selectByValue(`${formSelector} [name=${key}]`, data[key]);
                            }
                        );
                    case 'input':
                        return this.getAttribute(`${formSelector} [name=${key}]`, 'type').then(
                            function checkIfInputOrCheckbox(type) {
                                switch (type) {
                                    case 'checkbox':
                                        return this.checkCheckbox(`${formSelector} [name=${key}]`, data[key]);
                                    default:
                                        return this.setValue(`${formSelector} [name=${key}]`, data[key]);
                                }
                            }
                        );
                    default:
                        throw new Error(`Field type ${tagName} not yet supported`);
                }
            }).catch((e) => {
                logger.info(`could not find field ${formSelector} [name=${key}]`);
                throw e;
            });
        }, this).then(function submitForm() {
            if (submit) {
                logger.info(`submitting form ${formSelector}`);
                return this.click(`${formSelector} [type=submit]`);
            }
        });
    });

    client.addCommand('selectjQueryUISelect', function selectjQueryUISelect(selector, value) {
        const optionsSelector = `${selector} option`;
        const linkSelector = `${selector}+div a`;
        return this.waitForExist(selector)
            .getValue(optionsSelector)
            .then((options) => {
                let index = options.reduce((prev, curr, i) => {
                    return curr === value ? i : prev;
                }, -1);
                if (index === -1) {
                    throw new Error('Select value not found');
                }
                index++;
                const jqueryOptionsSelector = `.ui-selectmenu-menu.ui-selectmenu-open li:nth-child(${index}) a`;
                return this.click(linkSelector)
                    .waitForExist(jqueryOptionsSelector)
                    .click(jqueryOptionsSelector);
            });
    });

    client.addCommand('checkCheckbox', function checkCheckbox(selector, value) {
        return this.isSelected(selector).then(function clickIfSelected(selected) {
            const clickNeeded = selected !== value;
            if (clickNeeded) {
                return this.click(selector).catch(() => {
                    logger.info('Handling special case for XXXL on chrome');
                    return this.execute(function clickOnCheckbox(sel) {
                        return document.querySelector(sel).click();
                    }, selector);
                });
            }
            return this;
        });
    });
}
