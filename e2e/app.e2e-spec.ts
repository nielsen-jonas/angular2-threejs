import { ThreejsGamePage } from './app.po';

describe('threejs-game App', function() {
  let page: ThreejsGamePage;

  beforeEach(() => {
    page = new ThreejsGamePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('tjsg works!');
  });
});
