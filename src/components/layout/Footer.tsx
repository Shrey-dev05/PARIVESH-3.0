export function Footer() {
  return (
    <footer className="bg-brand-green text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-white flex flex-col items-center justify-center text-[8px] text-brand-green font-bold leading-tight">
                <span>CPC</span>
                <span>GREEN</span>
              </div>
              <span className="text-xl font-bold">PARIVESH 3.0</span>
            </div>
            <p className="text-sm text-green-50 mb-4">
              Ministry of Environment, Forest and Climate Change<br/>
              Indira Paryavaran Bhawan<br/>
              Jor Bagh Road, New Delhi - 110003
            </p>
            <p className="text-sm font-semibold text-green-100">
              Toll Free Number : 1800 11 9792
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <h3 className="font-bold text-lg mb-2">Important Links</h3>
            <a href="#" className="text-sm hover:underline text-green-100">Privacy Policy</a>
            <a href="#" className="text-sm hover:underline text-green-100">Terms of Use</a>
            <a href="#" className="text-sm hover:underline text-green-100">Accessibility Statement</a>
            <a href="#" className="text-sm hover:underline text-green-100">Disclaimer</a>
          </div>

          <div className="flex flex-col space-y-2 lg:items-end">
             <div className="bg-white/10 p-4 rounded-lg w-full max-w-[200px] text-center">
                <p className="text-xs uppercase tracking-wider mb-2 font-semibold text-green-100">Scan QR</p>
                {/* Mock QR */}
                <div className="w-24 h-24 bg-white/20 mx-auto rounded flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-1 w-16 h-16">
                     <div className="bg-white rounded-sm"></div>
                     <div className="bg-white rounded-sm"></div>
                     <div className="bg-white rounded-sm"></div>
                     <div className="bg-white rounded-sm"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-green-100">
          <p>
            PARIVESH portal is Designed, Developed and Hosted by National Informatics Centre, MeitY | Government of India
          </p>
          <p className="mt-2 md:mt-0">
            © 2026, Content Owned, Updated and Maintained by MoEFCC
          </p>
        </div>
      </div>
    </footer>
  );
}
