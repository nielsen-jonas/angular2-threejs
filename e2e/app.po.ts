import { browser, element, by } from 'protractor';

export class ThreejsGamePage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('tjsg-root h1')).getText();
  }
}
