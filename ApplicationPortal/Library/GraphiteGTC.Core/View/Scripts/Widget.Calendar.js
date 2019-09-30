// Calendar Widget
(function (window, document, Common, Cache, Events, Velocity, undefined) {

    var CalendarGlobals = {
        CalendarCreated: false,
        Days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        Months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        MonthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        MonthNameToNum: { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12 },
        DaysInMonth: { 'Jan': 31, 'Feb': 28, 'FebLeap': 29, 'Mar': 31, 'MarLeap': 31, 'Apr': 30, 'May': 31, 'Jun': 30, 'Jul': 31, 'Aug': 31, 'Sep': 30, 'Oct': 31, 'Nov': 30, 'Dec': 31 },
        InnerHtmlForDays: {
            'Jan': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">30</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay31" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay31-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay31-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Feb': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">30</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay28-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay28-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'FebLeap': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">30</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay29-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay29-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'MarLeap': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">28</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay31" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay31-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay31-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Mar': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">27</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay31" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay31-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay31-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Apr': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">30</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay30-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay30-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'May': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">29</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay31" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay31-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay31-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Jun': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">30</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay30-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay30-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Jul': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">29</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay31" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay31-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay31-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Aug': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">30</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay31" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay31-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay31-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Sep': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">30</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay30-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay30-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Oct': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">29</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay31" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay31-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay31-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Nov': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">30</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay30-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay30-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>',
            'Dec': '<ul><li id="LiDay1-00" class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px">29</li><li id="LiDay1-0" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay2" class="gtc-classLiDatePickerNotSelected">2</li><li id="LiDay3" class="gtc-classLiDatePickerNotSelected">3</li><li id="LiDay4" class="gtc-classLiDatePickerNotSelected">4</li><li id="LiDay5" class="gtc-classLiDatePickerNotSelected">5</li><li id="LiDay6" class="gtc-classLiDatePickerNotSelected">6</li><li id="LiDay7" class="gtc-classLiDatePickerNotSelected">7</li><li id="LiDay8" class="gtc-classLiDatePickerNotSelected">8</li><li id="LiDay9" class="gtc-classLiDatePickerNotSelected">9</li><li id="LiDay10" class="gtc-classLiDatePickerNotSelected">10</li><li id="LiDay11" class="gtc-classLiDatePickerNotSelected">11</li><li id="LiDay12" class="gtc-classLiDatePickerNotSelected">12</li><li id="LiDay13" class="gtc-classLiDatePickerNotSelected">13</li><li id="LiDay14" class="gtc-classLiDatePickerNotSelected">14</li><li id="LiDay15" class="gtc-classLiDatePickerNotSelected">15</li><li id="LiDay16" class="gtc-classLiDatePickerNotSelected">16</li><li id="LiDay17" class="gtc-classLiDatePickerNotSelected">17</li><li id="LiDay18" class="gtc-classLiDatePickerNotSelected">18</li><li id="LiDay19" class="gtc-classLiDatePickerNotSelected">19</li><li id="LiDay20" class="gtc-classLiDatePickerNotSelected">20</li><li id="LiDay21" class="gtc-classLiDatePickerNotSelected">21</li><li id="LiDay22" class="gtc-classLiDatePickerNotSelected">22</li><li id="LiDay23" class="gtc-classLiDatePickerNotSelected">23</li><li id="LiDay24" class="gtc-classLiDatePickerNotSelected">24</li><li id="LiDay25" class="gtc-classLiDatePickerNotSelected">25</li><li id="LiDay26" class="gtc-classLiDatePickerNotSelected">26</li><li id="LiDay27" class="gtc-classLiDatePickerNotSelected">27</li><li id="LiDay28" class="gtc-classLiDatePickerNotSelected">28</li><li id="LiDay29" class="gtc-classLiDatePickerNotSelected">29</li><li id="LiDay30" class="gtc-classLiDatePickerNotSelected">30</li><li id="LiDay31" class="gtc-classLiDatePickerNotSelected">31</li><li id="LiDay31-1" class="gtc-classLiDatePickerNotSelected">1</li><li id="LiDay31-2" class="gtc-classLiDatePickerNotSelected">2</li></ul>'
        },
        StartOfTime: 1800,
        EndOfTime: 2400
    };

    var CalendarWidget = {

        // Options
        options: {
            ClassCalendarActiveSelection: 'gtc-classControlCalendarActiveSelection',
            ClassCalendarLocked: 'gtc-input-locked',
            ParentElement: 'PageContent',
            UpdateValueCallback: ''
        },

        // Public Methods
        IsDisabled: function () {

            return GTC.IsControlDisabled(this.element);

        },

        DisableControl: function () {

            this._disableControl();

        },

        EnableControl: function () {

            this._enableControl();

        },

        // Private Methods

        // Sets the current date on load
        _initializeCurrentDateOnLoad: function (elementValue) {

            var dateObj;
            if (Common.IsNotDefined(elementValue) || Common.IsEmptyString(elementValue)) {
                dateObj = new Date();
            }
            else {
                dateObj = new Date(elementValue);
            }
            return dateObj;

        },

        // Sets the position and highlighting of year and month on load
        _initializeMonthYearOnLoad: function (date) {

            this._updateMarginTop('LiMonth000', this._findCorrectPosition('month', date) + 'px');
            Common.RemoveClass(Common.Query('.gtc-classLiDatePickerSelected', Common.Get('DivDatePickerMonth')), 'gtc-classLiDatePickerSelected');
            this._handleClassUpdate('LiMonth' + date.getMonth(), 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');
            this._updateMarginTop('LiYear00', this._findCorrectPosition('year', date) + 'px');
            Common.RemoveClass(Common.Query('.gtc-classLiDatePickerSelected', Common.Get('DivDatePickerYear')), 'gtc-classLiDatePickerSelected');
            this._handleClassUpdate('LiYear' + date.getFullYear(), 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');

        },

        // Loads the list of days for passed in month and sets position of currently selected day
        _setDaysForMonth: function (iMonth, date, CurrentDateObject) {

            var daysHtml = CalendarGlobals.InnerHtmlForDays[iMonth];
            if (CurrentDateObject) {
                CurrentDateObject.CurrentMonthLastDay = CalendarGlobals.DaysInMonth[iMonth];
            }
            if (this._isLeapYear(date.getFullYear()) && (iMonth == 'Feb' || iMonth == 'Mar')) {
                daysHtml = CalendarGlobals.InnerHtmlForDays[iMonth + 'Leap'];
                if (CurrentDateObject && iMonth == 'Feb') {
                    CurrentDateObject.CurrentMonthLastDay = CalendarGlobals.DaysInMonth[iMonth + 'Leap'];
                }
            }
            Common.Get('DivDatePickerDay').innerHTML = daysHtml;
            this._updateMarginTop('LiDay1-00', this._findCorrectPosition('day', date) + 'px');
            this._handleClassUpdate('LiDay' + date.getDate(), 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');

        },

        // sets display of date in header
        _setDateHeader: function (date) {

            Common.Get('H3SelectedDateDisplay').innerHTML = CalendarGlobals.Days[date.getDay()] + ', ' + CalendarGlobals.Months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

        },

        // returns true if passed in year is leap year
        _isLeapYear: function (iYear) {

            return new Date(iYear, 1, 29).getDate() == 29;

        },

        _preparePositionIndexingForAnimation: function (delta, PositionIndexingObject, ScrollingElement, CurrentDateObject) {

            if (delta > 0) {
                PositionIndexingObject.CurrentPosition = parseInt(PositionIndexingObject.CurrentPosition, 10) + 32;
                if (ScrollingElement.Changing == 'Day') {
                    PositionIndexingObject.CurrentClass = CurrentDateObject.CurrentDay;
                    PositionIndexingObject.NextClass = CurrentDateObject.CurrentDay - 1;
                    CurrentDateObject.CurrentDay = PositionIndexingObject.NextClass;
                }
                else if (ScrollingElement.Changing == 'Month') {
                    PositionIndexingObject.CurrentClass = CurrentDateObject.CurrentMonth;
                    PositionIndexingObject.NextClass = CurrentDateObject.CurrentMonth - 1;
                    CurrentDateObject.CurrentMonth = PositionIndexingObject.NextClass;
                }
                else if (ScrollingElement.Changing == 'Year') {
                    PositionIndexingObject.CurrentClass = CurrentDateObject.CurrentYear;
                    PositionIndexingObject.NextClass = CurrentDateObject.CurrentYear - 1;
                    CurrentDateObject.CurrentYear = PositionIndexingObject.NextClass;
                }
            }
            else {
                PositionIndexingObject.CurrentPosition = parseInt(PositionIndexingObject.CurrentPosition, 10) - 32;
                if (ScrollingElement.Changing == 'Day') {
                    PositionIndexingObject.CurrentClass = CurrentDateObject.CurrentDay;
                    PositionIndexingObject.NextClass = CurrentDateObject.CurrentDay + 1;
                    CurrentDateObject.CurrentDay = PositionIndexingObject.NextClass;
                }
                else if (ScrollingElement.Changing == 'Month') {
                    PositionIndexingObject.CurrentClass = CurrentDateObject.CurrentMonth;
                    PositionIndexingObject.NextClass = CurrentDateObject.CurrentMonth + 1;
                    CurrentDateObject.CurrentMonth = PositionIndexingObject.NextClass;
                }
                else if (ScrollingElement.Changing == 'Year') {
                    PositionIndexingObject.CurrentClass = CurrentDateObject.CurrentYear;
                    PositionIndexingObject.NextClass = CurrentDateObject.CurrentYear + 1;
                    CurrentDateObject.CurrentYear = PositionIndexingObject.NextClass;
                }
            }

        },

        // Moves month/day/year on scroll and handles other date logic
        _animateCalendarOnScroll: function (event, delta) {

            if (Common.IsFunction(event.stopPropagation)) {
                event.stopPropagation();
            }
            if (Common.IsFunction(event.preventDefault)) {
                event.preventDefault();
            }
            var thisWidget = event.data.ThisWidget;
            var CurrentDateObject = event.data.CurrentDateObject;
            var ScrollingElement = Cache.Get(event.data.ScrollingElement, 'ScrollingElement');
            var PositionIndexingObject = {};
            PositionIndexingObject.CurrentClass = 0;
            PositionIndexingObject.NextClass = 0;
            PositionIndexingObject.CurrentPosition = Common.GetStyle(Common.Get('Li' + ScrollingElement.CurrentListener), 'margin-top');
            thisWidget._preparePositionIndexingForAnimation(delta, PositionIndexingObject, ScrollingElement, CurrentDateObject);
            if (ScrollingElement.Changing == 'Month' && CurrentDateObject.CurrentMonth == 12) {
                thisWidget._changeMonthEndOfYear(ScrollingElement, PositionIndexingObject, CurrentDateObject);
            }
            else if (ScrollingElement.Changing == 'Month' && CurrentDateObject.CurrentMonth == -1) {
                thisWidget._changeMonthStartOfYear(ScrollingElement, PositionIndexingObject, CurrentDateObject);
            }
            else if (ScrollingElement.Changing == 'Month' && CurrentDateObject.CurrentMonth != 12 && CurrentDateObject.CurrentMonth != -1) {
                thisWidget._changeMonth(ScrollingElement, PositionIndexingObject, CurrentDateObject);
            }
            else if (ScrollingElement.Changing == 'Day' && CurrentDateObject.CurrentDay == CurrentDateObject.CurrentMonthLastDay + 1) {
                thisWidget._changeDayEndOfMonth(ScrollingElement, PositionIndexingObject, CurrentDateObject);
            }
            else if (ScrollingElement.Changing == 'Day' && CurrentDateObject.CurrentDay == 0) {
                thisWidget._changeDayStartOfMonth(ScrollingElement, PositionIndexingObject, CurrentDateObject);
            }
            else if (ScrollingElement.Changing == 'Day' && CurrentDateObject.CurrentDay != CurrentDateObject.CurrentMonthLastDay + 1 && CurrentDateObject.CurrentDay != 0) {
                thisWidget._changeDay(ScrollingElement, PositionIndexingObject);
            }
            else if (ScrollingElement.Changing == 'Year' && CurrentDateObject.CurrentYear == CalendarGlobals.EndOfTime + 1) {
                thisWidget._changeYearEndOfTime(ScrollingElement, PositionIndexingObject, CurrentDateObject);
            }
            else if (ScrollingElement.Changing == 'Year' && CurrentDateObject.CurrentYear == CalendarGlobals.StartOfTime - 1) {
                thisWidget._changeYearStartOfTime(ScrollingElement, PositionIndexingObject, CurrentDateObject);
            }
            else if (ScrollingElement.Changing == 'Year' && CurrentDateObject.CurrentYear != CalendarGlobals.EndOfTime + 1 && CurrentDateObject.CurrentYear != CalendarGlobals.StartOfTime - 1) {
                thisWidget._changeYear(ScrollingElement, PositionIndexingObject);
            }
            thisWidget._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            thisWidget._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.NextClass, 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');
            thisWidget._setDateHeader(thisWidget._buildDateObjFromCurrentDateObject(CurrentDateObject));

        },

        _changeMonthEndOfYear: function (ScrollingElement, PositionIndexingObject, CurrentDateObject) {

            var leap = this._appendLeapOnLeapYear(CurrentDateObject);
            if (CurrentDateObject.CurrentDay > CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap]) {
                CurrentDateObject.CurrentDay = CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap];
            }
            this._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, '-33px');
            PositionIndexingObject.CurrentClass = 0;
            PositionIndexingObject.NextClass = 0;
            CurrentDateObject.CurrentMonth = 0;
            this._handleClassUpdate('LiYear' + CurrentDateObject.CurrentYear, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            this._handleStartEndOfTime(CurrentDateObject, 'up');
            this._handleClassUpdate('LiYear' + CurrentDateObject.CurrentYear, 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');
            this._updateMarginTop('LiYear00', this._findCorrectPosition('year', this._buildDateObjFromCurrentDateObject(CurrentDateObject)) + 'px');

        },

        _changeMonthStartOfYear: function (ScrollingElement, PositionIndexingObject, CurrentDateObject) {

            var leap = this._appendLeapOnLeapYear(CurrentDateObject);
            if (CurrentDateObject.CurrentDay > CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap]) {
                CurrentDateObject.CurrentDay = CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap];
            }
            this._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, '-385px');
            PositionIndexingObject.CurrentClass = 11;
            PositionIndexingObject.NextClass = 11;
            CurrentDateObject.CurrentMonth = 11;
            this._handleClassUpdate('LiYear' + CurrentDateObject.CurrentYear, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            this._handleStartEndOfTime(CurrentDateObject, 'down');
            this._handleClassUpdate('LiYear' + CurrentDateObject.CurrentYear, 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');
            this._updateMarginTop('LiYear00', this._findCorrectPosition('year', this._buildDateObjFromCurrentDateObject(CurrentDateObject)) + 'px');

        },

        _changeMonth: function (ScrollingElement, PositionIndexingObject, CurrentDateObject) {

            var leap = this._appendLeapOnLeapYear(CurrentDateObject);
            if (CurrentDateObject.CurrentDay > CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap]) {
                CurrentDateObject.CurrentDay = CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap];
            }
            this._setDaysForMonth(CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth], this._buildDateObjFromCurrentDateObject(CurrentDateObject), CurrentDateObject);
            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, PositionIndexingObject.CurrentPosition + 'px');

        },

        _changeDayEndOfMonth: function (ScrollingElement, PositionIndexingObject, CurrentDateObject) {

            this._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, '-33px');
            PositionIndexingObject.CurrentClass = 1;
            PositionIndexingObject.NextClass = 1;
            CurrentDateObject.CurrentDay = 1;
            this._handleClassUpdate('LiMonth' + CurrentDateObject.CurrentMonth, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            CurrentDateObject.CurrentMonth++;
            if (CurrentDateObject.CurrentMonth == 12) {
                this._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
                this._updateMarginTop('Li' + ScrollingElement.CurrentListener, '-33px');
                CurrentDateObject.CurrentMonth = 0;
                this._handleClassUpdate('LiYear' + CurrentDateObject.CurrentYear, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
                this._handleStartEndOfTime(CurrentDateObject, 'up');
                this._handleClassUpdate('LiYear' + CurrentDateObject.CurrentYear, 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');
                this._updateMarginTop('LiYear00', this._findCorrectPosition('year', this._buildDateObjFromCurrentDateObject(CurrentDateObject)) + 'px');
            }
            this._handleClassUpdate('LiMonth' + CurrentDateObject.CurrentMonth, 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');
            this._updateMarginTop('LiMonth000', this._findCorrectPosition('month', this._buildDateObjFromCurrentDateObject(CurrentDateObject)) + 'px');
            this._setDaysForMonth(CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth], this._buildDateObjFromCurrentDateObject(CurrentDateObject), CurrentDateObject);

        },

        _changeDayStartOfMonth: function (ScrollingElement, PositionIndexingObject, CurrentDateObject) {

            this._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            this._handleClassUpdate('LiMonth' + CurrentDateObject.CurrentMonth, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            CurrentDateObject.CurrentMonth--;
            var startingMonthValue = CurrentDateObject.CurrentMonth;
            if (startingMonthValue == -1) {
                this._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
                this._updateMarginTop('Li' + ScrollingElement.CurrentListener, '-385px');
                PositionIndexingObject.CurrentClass = 11;
                PositionIndexingObject.NextClass = 11;
                CurrentDateObject.CurrentMonth = 11;
                this._handleClassUpdate('LiYear' + CurrentDateObject.CurrentYear, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
                this._handleStartEndOfTime(CurrentDateObject, 'down');
                this._handleClassUpdate('LiYear' + CurrentDateObject.CurrentYear, 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');
            }
            var leap = this._appendLeapOnLeapYear(CurrentDateObject);
            this._handleClassUpdate('LiMonth' + CurrentDateObject.CurrentMonth, 'gtc-classLiDatePickerNotSelected', 'gtc-classLiDatePickerSelected');
            PositionIndexingObject.CurrentClass = CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap];
            PositionIndexingObject.NextClass = CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap];
            CurrentDateObject.CurrentDay = CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap];
            this._updateMarginTop('LiMonth000', this._findCorrectPosition('month', this._buildDateObjFromCurrentDateObject(CurrentDateObject)) + 'px');
            this._setDaysForMonth(CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] + leap, this._buildDateObjFromCurrentDateObject(CurrentDateObject), CurrentDateObject);
            if (startingMonthValue == -1) {
                this._updateMarginTop('LiYear00', this._findCorrectPosition('year', this._buildDateObjFromCurrentDateObject(CurrentDateObject)) + 'px');
            }
            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, this._findCorrectPosition('day', this._buildDateObjFromCurrentDateObject(CurrentDateObject)) + 'px');

        },

        _changeDay: function (ScrollingElement, PositionIndexingObject) {

            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, PositionIndexingObject.CurrentPosition + 'px');

        },

        _changeYearEndOfTime: function (ScrollingElement, PositionIndexingObject, CurrentDateObject) {

            this._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, '-33px');
            PositionIndexingObject.CurrentClass = CalendarGlobals.StartOfTime;
            PositionIndexingObject.NextClass = CalendarGlobals.StartOfTime;
            CurrentDateObject.CurrentYear = CalendarGlobals.StartOfTime;

        },

        _changeYearStartOfTime: function (ScrollingElement, PositionIndexingObject, CurrentDateObject) {

            this._handleClassUpdate('Li' + ScrollingElement.Changing + PositionIndexingObject.CurrentClass, 'gtc-classLiDatePickerSelected', 'gtc-classLiDatePickerNotSelected');
            PositionIndexingObject.CurrentClass = CalendarGlobals.EndOfTime;
            PositionIndexingObject.NextClass = CalendarGlobals.EndOfTime;
            CurrentDateObject.CurrentYear = CalendarGlobals.EndOfTime;
            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, this._findCorrectPosition('year', this._buildDateObjFromCurrentDateObject(CurrentDateObject)) + 'px');

        },

        _changeYear: function (ScrollingElement, PositionIndexingObject) {

            this._updateMarginTop('Li' + ScrollingElement.CurrentListener, PositionIndexingObject.CurrentPosition + 'px');

        },

        _handleClassUpdate: function (id, removeClass, addClass) {

            var element = Common.Get(id);
            Common.RemoveClass(element, removeClass);
            Common.AddClass(element, addClass);

        },

        _updateMarginTop: function (id, marginTop) {

            Common.Get(id).style.marginTop = marginTop;

        },

        _handleStartEndOfTime: function (CurrentDateObject, scrollDirection) {

            if (CurrentDateObject.CurrentYear == CalendarGlobals.StartOfTime && scrollDirection == 'down') {
                CurrentDateObject.CurrentYear = CalendarGlobals.EndOfTime;
            }
            else if (CurrentDateObject.CurrentYear == CalendarGlobals.EndOfTime && scrollDirection == 'up') {
                CurrentDateObject.CurrentYear = CalendarGlobals.StartOfTime;
            }
            else {
                if (scrollDirection == 'up') {
                    CurrentDateObject.CurrentYear++;
                }
                else if (scrollDirection == 'down') {
                    CurrentDateObject.CurrentYear--;
                }
            }

        },

        _appendLeapOnLeapYear: function (CurrentDateObject) {

            if (this._isLeapYear(CurrentDateObject.CurrentYear) && (CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] == 'Feb' || CalendarGlobals.MonthsShort[CurrentDateObject.CurrentMonth] == 'Mar')) {
                return 'Leap';
            }
            else {
                return '';
            }

        },

        // Finds the position of li in list
        _findCorrectPosition: function (which, date) {

            var startingPixelPosition = -1;
            if (which == 'day') {
                return startingPixelPosition - (date.getDate() * 32);
            }
            else if (which == 'month') {
                return startingPixelPosition - ((date.getMonth() + 1) * 32);
            }
            else if (which == 'year') {
                return startingPixelPosition - ((date.getFullYear() - CalendarGlobals.StartOfTime + 1) * 32);
            }
            return startingPixelPosition;

        },

        _buildDateObjFromSelectedValues: function () {

            var buildDate = '';
            var findDateVals = Common.QueryAll('.gtc-classLiDatePickerSelected', Common.Get('DivDatePicker'));
            var index = 0, length = findDateVals.length;
            for ( ; index < length; index++) {
                if (index == 0) {
                    buildDate += CalendarGlobals.MonthNameToNum[findDateVals[index].innerHTML];
                }
                else {
                    buildDate += findDateVals[index].innerHTML;
                }
                if (index != 2) {
                    buildDate += '/';
                }
            }
            var dateObj;
            if (Common.IsNotDefined(buildDate) || Common.IsEmptyString(buildDate)) {
                dateObj = new Date();
            }
            else {
                dateObj = new Date(buildDate);
            }
            return dateObj;

        },

        _buildDateObjFromCurrentDateObject: function (CurrentDateObject) {

            var buildDate = (CurrentDateObject.CurrentMonth + 1) + '/' + CurrentDateObject.CurrentDay + '/' + CurrentDateObject.CurrentYear;
            return new Date(buildDate);

        },

        _buildCurrentDateObjectForAnimate: function (dateObj) {

            var currentMonth = dateObj.getMonth();
            var currentDay = dateObj.getDate();
            var currentYear = dateObj.getFullYear();
            var currentMonthLastDay = CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[currentMonth]];
            if (this._isLeapYear(currentYear) && (CalendarGlobals.MonthsShort[currentMonth] == 'Feb' || CalendarGlobals.MonthsShort[currentMonth] == 'Mar')) {
                if (CalendarGlobals.MonthsShort[currentMonth] == 'Feb') {
                    currentMonthLastDay = CalendarGlobals.DaysInMonth[CalendarGlobals.MonthsShort[currentMonth] + 'Leap'];
                }
            }
            var CurrentDateObject = {};
            CurrentDateObject.CurrentMonth = currentMonth;
            CurrentDateObject.CurrentDay = currentDay;
            CurrentDateObject.CurrentYear = currentYear;
            CurrentDateObject.CurrentMonthLastDay = currentMonthLastDay;
            return CurrentDateObject;

        },

        // Builds each date picker section for display
        _buildDatePicker: function () {

            var datePickerMarkup = '<div class="gtc-classDivDatePicker" id="DivDatePicker" style="display: none; position: absolute;"><span class="gtc-sr-only" data-translate="BeginningOfContent508">' + Common.TranslateKey('BeginningOfContent508') + '</span>';
            datePickerMarkup += '<div class="gtc-classDivDatePickerHeader"><h3 class="gtc-classH3DatePickerHeader" id="H3SelectedDateDisplay"></h3></div>';
            datePickerMarkup += '<div class="gtc-classDivDatePickerContent"><div class="gtc-classDivDatePickerScrollArea" id="DivDatePickerMonth"><ul>';
            datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" style="margin-top: 32px;" id="LiMonth000">' + CalendarGlobals.MonthsShort[10] + '</li>';
            datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiMonth00">' + CalendarGlobals.MonthsShort[11] + '</li>';
            var index = 0, length = CalendarGlobals.MonthsShort.length;
            for ( ; index < length; index++) {
                datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiMonth' + index + '">' + CalendarGlobals.MonthsShort[index] + '</li>';
            }
            datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiMonth12">' + CalendarGlobals.MonthsShort[0] + '</li>';
            datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiMonth13">' + CalendarGlobals.MonthsShort[1] + '</li></ul>';
            datePickerMarkup += '</div>';
            datePickerMarkup += '<div class="gtc-classDivDatePickerScrollArea" id="DivDatePickerDay"></div>';
            datePickerMarkup += '<div class="gtc-classDivDatePickerScrollArea" id="DivDatePickerYear"><ul>';
            datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiYear00" style="margin-top: 32px;">' + (CalendarGlobals.EndOfTime - 1) + '</li>';
            datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiYear0">' + CalendarGlobals.EndOfTime + '</li>';
            index = CalendarGlobals.StartOfTime;
            for ( ; index <= CalendarGlobals.EndOfTime; index++) {
                datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiYear' + index + '">' + index + '</li>';
            }
            datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiYearEnd0">' + CalendarGlobals.StartOfTime + '</li>';
            datePickerMarkup += '<li class="gtc-classLiDatePickerNotSelected" id="LiYearEnd00">' + (CalendarGlobals.StartOfTime + 1) + '</li></ul></div></div>';
            datePickerMarkup += '<div class="gtc-classDivDatePickerSelected" style="pointer-events: none;"></div><div class="gtc-classDivDatePickerControls">';
            datePickerMarkup += '<span class="gtc-classSpanDatePickerCloseButton" id="SpanCloseButton">Close</span>';
            datePickerMarkup += '<span class="gtc-classSpanDatePickerSetButton" id="SpanSetDateButton">Set Date</span></div><span class="gtc-sr-only" data-translate="EndOfContent508">' + Common.TranslateKey('EndOfContent508') + '</span></div>';
            Common.InsertHTMLString(document.body, Common.InsertType.Append, datePickerMarkup);

        },

        _insertOpenCalendarAnchor: function () {

            var tabIndex = Common.GetAttr(this.element, 'tabindex');
            var tabIndexAttribute = '';
            if (Common.IsDefined(tabIndex) && parseInt(tabIndex, 10) > 0) {
                tabIndexAttribute = ' tabindex="' + tabIndex + '"';
            }
            var anchorName = 'AnchorOpenCalendar-' + this.element.name;
            Common.InsertHTMLString(this.element, Common.InsertType.After, '<a' + tabIndexAttribute + ' class="gtc-input-system" id="' + anchorName + '" aria-haspopup="true"><i class="gtc-icon-styles fa fa-calendar"></i><span class="gtc-sr-only" data-translate="OpensSimulatedDialog508">' + Common.TranslateKey('OpensSimulatedDialog508') + '</span></a>');

            // 508 Compliance - Focus In/Focus Out
            var anchor = Common.Get(anchorName);
            Events.On(anchor, 'focusin.' + anchorName,
                function (event) {
                    Events.On(document, 'keyup.' + anchorName,
                        function (event) {
                            var pressedKeyCode = (event.keyCode ? event.keyCode : event.which);
                            if (pressedKeyCode == GTC.Keyboard.Enter) {
                                document.activeElement.blur();
                                var element = Common.Get(anchorName);
                                Events.Trigger(element, 'click');
                            }
                        }
                    );
                }
            );
            Events.On(anchor, 'focusout.' + anchorName,
                function (event) {
                    Events.Off(document, 'keyup.' + anchorName);
                }
            );

        },

        _bindCalendarCloseOnBodyClickEvent: function () {

            var thisWidget = this;
            Events.On(document.body, 'click.calendarCloseOnBodyClick.DivDatePicker',
                function (event) {
                    var eventTarget = event.target;
                    if (Common.IsNotDefined(Common.Closest('#DivDatePicker', eventTarget)) && Common.GetAttr(eventTarget, 'class') != 'gtc-classInputCalendar') {
                        Events.Off(document.body, 'click.calendarCloseOnBodyClick');
                        Velocity(Common.Get('DivDatePicker'), 'fadeOut', 400,
                            function () {
                                var properInstance = thisWidget._loadProperInstance();
                                Events.Trigger(properInstance.element, 'focus');
                                properInstance._adjustHeightOnClose();
                            }
                        );
                    }
                }
            );

        },

        _bindCloseButtonEvent: function () {

            var thisWidget = this;
            var closeButton = Common.Get('SpanCloseButton');
            Events.Off(closeButton, 'click.calendarSpanCloseButtonClick');
            Events.On(closeButton, 'click.calendarSpanCloseButtonClick',
                function (event) {
                    event.preventDefault();
                    Events.Off(document.body, 'click.calendarCloseOnBodyClick');
                    Events.Off(document, 'keydown.calendarKeyboardClicks');
                    Velocity(Common.Get('DivDatePicker'), 'fadeOut', 400,
                        function () {
                            var properInstance = thisWidget._loadProperInstance();
                            Events.Trigger(properInstance.element, 'focus');
                            properInstance._adjustHeightOnClose();
                        }
                    );
                }
            );

        },

        _bindSetDateButtonEvent: function () {

            var thisWidget = this;

            var setDateButton = Common.Get('SpanSetDateButton');
            Events.Off(setDateButton, 'click.calendarSpanSetDateButtonClick');
            Events.On(setDateButton, 'click.calendarSpanSetDateButtonClick',
                function (event) {
                    event.preventDefault();
                    var properInstance = thisWidget._loadProperInstance();
                    var buildDate = properInstance._buildDateObjFromSelectedValues();
                    var divDatePicker = Common.Get('DivDatePicker');
                    var builtStringDate = (buildDate.getMonth() + 1) + '/' + buildDate.getDate() + '/' + buildDate.getFullYear();
                    Events.Off(document.body, 'click.calendarCloseOnBodyClick');
                    Events.Off(document, 'keydown.calendarKeyboardClicks');
                    Velocity(divDatePicker, 'fadeOut', 400,
                        function () {
                            Events.Trigger(properInstance.element, 'focus');
                            properInstance._adjustHeightOnClose();
                        }
                    );

                    // Get Milliseonds from 1970
                    var milliSecondsFrom1970 = Date.parse(builtStringDate);

                    // Build Date String
                    var rawData = '/Date(' + milliSecondsFrom1970.toString() + ')/';
                    if (Common.IsFunction(properInstance.options.UpdateValueCallback)) {
                        if (Common.IsNotEmptyString(builtStringDate)) {
                            properInstance.options.UpdateValueCallback(rawData, properInstance.element);
                        }
                    }
                    else {
                        MaskField.UpdateValue(properInstance.element, rawData);
                    }
                }
            );

        },

        _removeAllSelections: function () {

            Events.Trigger(Common.Get('DivDatePickerMonth'), 'mouseleave');
            Events.Trigger(Common.Get('DivDatePickerDay'), 'mouseleave');
            Events.Trigger(Common.Get('DivDatePickerYear'), 'mouseleave');

        },

        _prepareForKeyboardSelection: function () {

            Events.Off(document, 'keydown.calendarSetSelection');
            Events.On(document, 'keydown.calendarSetSelection.DivDatePicker',
                function (event) {
                    switch (event.keyCode) {
                        case GTC.Keyboard.Up:
                            Events.Off(document, 'keydown.calendarSetSelection');
                            Events.Trigger(Common.Get('DivDatePickerDay'), 'mouseenter');
                            break;
                        case GTC.Keyboard.Down:
                            Events.Off(document, 'keydown.calendarSetSelection');
                            Events.Trigger(Common.Get('DivDatePickerDay'), 'mouseenter');
                            break;
                        case GTC.Keyboard.Left:
                            Events.Off(document, 'keydown.calendarSetSelection');
                            Events.Trigger(Common.Get('DivDatePickerYear'), 'mouseenter');
                            break;
                        case GTC.Keyboard.Right:
                            Events.Off(document, 'keydown.calendarSetSelection');
                            Events.Trigger(Common.Get('DivDatePickerMonth'), 'mouseenter');
                            break;
                        case GTC.Keyboard.Enter:
                            Events.Off(document, 'keydown.calendarSetSelection');
                            Events.Trigger(Common.Get('SpanSetDateButton'), 'click');
                            break;
                        case GTC.Keyboard.Escape:
                            Events.Off(document, 'keydown.calendarSetSelection');
                            Events.Trigger(Common.Get('SpanCloseButton'), 'click');
                            break;
                    }
                }
            );

        },

        _adjustHeightOnClose: function () {

            // Initialize
            var thisWidget = this;

            // Adjust Height if it was added
            if (thisWidget.IsHeightIncreased) {
                thisWidget.IsHeightIncreased = false;
                if (Common.IsModal()) {
                    var modalCalendar = window.parent.Common.Query('.gtc-modal-iframe', null, true);
                    var newHeight = Common.Height(modalCalendar.parentNode) - thisWidget.HeightIncrease;
                    modalCalendar.parentNode.style.height = newHeight + 'px';
                }
                else {
                    var parentElement = Common.Get(thisWidget.options.ParentElement);
                    var newHeight = Common.Height(parentElement) - thisWidget.HeightIncrease;
                    parentElement.style.height = newHeight + 'px';
                }
            }

        },

        _bindCalendarOpenEvent: function () {

            var thisWidget = this;

            Events.On(Common.Get('AnchorOpenCalendar-' + thisWidget.element.name), 'click.calendarOpenAnchor',
                function (event) {
                    event.preventDefault();

                    // Remove this event immediately in case a previous field had calendar open before events could be removed
                    Events.Off(document.body, 'click.calendarCloseOnBodyClick');

                    // Check if in modal and if resizing
                    if (Common.IsModal() && Common.IsDefined(Common.Query('body.gtc-modal-resizing'))) {
                        return;
                    }
                    var thisPrev = Common.GetSibling(this, Common.SiblingType.Previous);
                    var thisParent = this.parentNode;
                    thisWidget._removeAllSelections();
                    var elementValue = thisPrev.value;

                    // TODO: Solve for all date formats
                    var mask = JSON.parse(Common.GetAttr(thisPrev, 'data-mask'));
                    if (Common.IsDefined(mask) && mask.Definition == 'DD/MM/YYYY') {
                        elementValue = elementValue.replace(/([0-9]+)\/([0-9]+)/, '$2/$1');
                    }
                    var passedDate = thisWidget._initializeCurrentDateOnLoad(elementValue);
                    var selectedLis = Common.QueryAll('li.gtc-classLiDatePickerSelected');
                    Common.RemoveClassFromElements(selectedLis, 'gtc-classLiDatePickerSelected');
                    Common.AddClassToElements(selectedLis, 'gtc-classLiDatePickerNotSelected');
                    var divDatePicker = Common.Get('DivDatePicker');
                    Cache.Set(divDatePicker, 'currentElement', thisPrev.name);
                    thisWidget._bindCloseButtonEvent();
                    thisWidget._bindSetDateButtonEvent();
                    thisWidget._initializeMonthYearOnLoad(passedDate);
                    thisWidget._setDaysForMonth(CalendarGlobals.MonthsShort[passedDate.getMonth()], passedDate, false);
                    thisWidget._setDateHeader(passedDate);
                    var coords = Common.Offset(thisPrev);
                    var divDatePickerStyle = divDatePicker.style;
                    divDatePickerStyle.top = (coords.top + Common.Height(thisParent)) + 'px';
                    divDatePickerStyle.left = coords.left + 'px';
                    Velocity(divDatePicker, 'fadeIn', 400,
                        function () {
                            thisWidget._bindCalendarCloseOnBodyClickEvent();
                        }
                    );

                    // Adjust screen height if needed
                    var calendarDisplayHeight = Common.Height(divDatePicker, true);
                    var parentElement = Common.Get(thisWidget.options.ParentElement);
                    if (Common.IsDefined(parentElement) && !Common.IsModal()) {
                        var parentElementHeight = Common.Height(parentElement);
                        var containerElementHeight = Common.Offset(parentElement).top + parentElementHeight;
                        var calendarHeight = Common.Offset(divDatePicker).top + calendarDisplayHeight + 10;
                        if (calendarHeight > containerElementHeight && containerElementHeight > 0) {
                            thisWidget.IsHeightIncreased = true;
                            thisWidget.HeightIncrease = calendarHeight - containerElementHeight;
                            parentElement.style.height = (parentElementHeight + thisWidget.HeightIncrease) + 'px';
                        }
                    }
                    else if (Common.IsModal()) {
                        var modalCalendarParent = window.parent.Common.Query('.gtc-modal-iframe', null, true).parentNode;
                        var modalCalendarParentOffset = Common.Offset(modalCalendarParent);
                        var modalBottom = Common.Height(modalCalendarParent, true) + modalCalendarParentOffset.top;
                        var calendarBottom = calendarDisplayHeight + Common.Offset(thisParent).top + coords.top + Common.Height(thisParent) + modalCalendarParentOffset.top;
                        if (calendarBottom > modalBottom) {
                            thisWidget.IsHeightIncreased = true;
                            thisWidget.HeightIncrease = calendarBottom - modalBottom + (calendarDisplayHeight * 2);
                            var modalCalendarParentHeight = Common.Height(modalCalendarParent);
                            modalCalendarParent.style.height = (modalCalendarParentHeight + thisWidget.HeightIncrease) + 'px';
                        }
                    }

                    // Bind keyboard clicks
                    thisWidget._prepareForKeyboardSelection();
                }
            );

        },

        _buildFakeEventObject: function (CurrentDateObject, ScrollingElement, ThisWidget) {

            var fakeEvent = {};
            fakeEvent.data = {};
            fakeEvent.data.CurrentDateObject = CurrentDateObject;
            fakeEvent.data.ScrollingElement = ScrollingElement;
            fakeEvent.data.ThisWidget = ThisWidget;
            return fakeEvent;

        },

        _bindCalendarKeyboardClicks: function (CurrentDateObject, ScrollingElement) {

            var thisWidget = this;

            Events.Off(document, 'keydown.calendarKeyboardClicks');
            Events.On(document, 'keydown.calendarKeyboardClicks.DivDatePicker',
                function (event) {
                    var fakeEvent = thisWidget._buildFakeEventObject(CurrentDateObject, ScrollingElement, thisWidget);

                    // Process Key
                    switch (event.keyCode) {
                        case GTC.Keyboard.Down:
                            thisWidget._animateCalendarOnScroll(fakeEvent, 0);
                            break;
                        case GTC.Keyboard.Up:
                            thisWidget._animateCalendarOnScroll(fakeEvent, 1);
                            break;
                        case GTC.Keyboard.Left:
                            var currentElementData = Cache.Get(ScrollingElement, 'ScrollingElement');
                            if (currentElementData.Changing == 'Month') {
                                Events.Trigger(Common.Get('DivDatePickerMonth'), 'mouseleave');
                                Events.Trigger(Common.Get('DivDatePickerYear'), 'mouseenter');
                            }
                            else if (currentElementData.Changing == 'Day') {
                                Events.Trigger(Common.Get('DivDatePickerDay'), 'mouseleave');
                                Events.Trigger(Common.Get('DivDatePickerMonth'), 'mouseenter');
                            }
                            else if (currentElementData.Changing == 'Year') {
                                Events.Trigger(Common.Get('DivDatePickerYear'), 'mouseleave');
                                Events.Trigger(Common.Get('DivDatePickerDay'), 'mouseenter');
                            }
                            break;
                        case GTC.Keyboard.Right:
                            var currentElementData = Cache.Get(ScrollingElement, 'ScrollingElement');
                            if (currentElementData.Changing == 'Month') {
                                Events.Trigger(Common.Get('DivDatePickerMonth'), 'mouseleave');
                                Events.Trigger(Common.Get('DivDatePickerDay'), 'mouseenter');
                            }
                            else if (currentElementData.Changing == 'Day') {
                                Events.Trigger(Common.Get('DivDatePickerDay'), 'mouseleave');
                                Events.Trigger(Common.Get('DivDatePickerYear'), 'mouseenter');
                            }
                            else if (currentElementData.Changing == 'Year') {
                                Events.Trigger(Common.Get('DivDatePickerYear'), 'mouseleave');
                                Events.Trigger(Common.Get('DivDatePickerMonth'), 'mouseenter');
                            }
                            break;
                        case GTC.Keyboard.Enter:
                            Events.Trigger(Common.Get('SpanSetDateButton'), 'click');
                            break;
                        case GTC.Keyboard.Escape:
                            Events.Trigger(Common.Get('SpanCloseButton'), 'click');
                            break;
                    }
                }
            );

        },

        _bindCalendarTouchEvents: function (CurrentDateObject, ScrollingElement) {

            var thisWidget = this;
            var fakeEvent = thisWidget._buildFakeEventObject(CurrentDateObject, ScrollingElement, thisWidget);

            // Setup touch swipe events
            Touch.InitializeTouchEvents();
            Events.On(ScrollingElement, 'swipedown',
                function () {
                    Events.Off(this, 'mousewheel');
                    thisWidget._animateCalendarOnScroll(fakeEvent, 1);
                    thisWidget._initializeMonthYearOnLoad(CurrentDateObject);
                }
            );
            Events.On(ScrollingElement, 'swipeup',
                function () {
                    Events.Off(this, 'mousewheel');
                    thisWidget._animateCalendarOnScroll(fakeEvent, 0);
                    thisWidget._initializeMonthYearOnLoad(CurrentDateObject);
                }
            );

        },

        _bindMouseEnterEvent: function () {

            var thisWidget = this;

            // Initialize normalization of scroll event values
            Scroll.InitializeScrollEvents();

            var dateSections = Common.QueryAll('#DivDatePickerMonth, #DivDatePickerDay, #DivDatePickerYear');
            Events.Off(dateSections, 'mouseenter.calendarScrollEvents');
            Events.On(dateSections, 'mouseenter.calendarScrollEvents',
                function (event) {
                    event.preventDefault();
                    thisWidget._removeAllSelections();
                    var buildDate = thisWidget._buildDateObjFromSelectedValues();
                    var CurrentDateObject = thisWidget._buildCurrentDateObjectForAnimate(buildDate);
                    Common.AddClass(this, 'gtc-classControlCalendarActiveSelection');
                    thisWidget._bindCalendarKeyboardClicks(CurrentDateObject, this);
                    thisWidget._bindCalendarTouchEvents(CurrentDateObject, this);
                    Events.Off(this, 'mousewheel');
                    Events.On(this, 'mousewheel', { CurrentDateObject: CurrentDateObject, ScrollingElement: this, ThisWidget: thisWidget }, thisWidget._animateCalendarOnScroll);
                }
            );

        },

        _bindMouseLeaveEvent: function () {

            var dateSections = Common.QueryAll('#DivDatePickerMonth, #DivDatePickerDay, #DivDatePickerYear');
            Events.Off(dateSections, 'mouseleave.calendarScrollEvents');
            Events.On(dateSections, 'mouseleave.calendarScrollEvents',
                function (event) {
                    event.preventDefault();
                    Common.RemoveClass(this, 'gtc-classControlCalendarActiveSelection');
                    Events.Off(document, 'keydown.calendarKeyboardClicks');
                    Events.Off(this, 'mousewheel');
                }
            );

        },

        _defineCalendarListenerIds: function () {

            Cache.Set(Common.Get('DivDatePickerMonth'), 'ScrollingElement', { CurrentListener: 'Month000', Changing: 'Month' });
            Cache.Set(Common.Get('DivDatePickerDay'), 'ScrollingElement', { CurrentListener: 'Day1-00', Changing: 'Day' });
            Cache.Set(Common.Get('DivDatePickerYear'), 'ScrollingElement', { CurrentListener: 'Year00', Changing: 'Year' });

        },

        _loadProperInstance: function () {

            return Cache.Get(Common.Get(Cache.Get(Common.Get('DivDatePicker'), 'currentElement')), 'gtc-calendar');

        },

        _disableControl: function () {

            if (!this.Locked) {
                this.Locked = true;
                Common.SetAttr(this.element, 'disabled', 'disabled');
                Common.SetAttr(this.element, 'tabindex', '-1');
                Common.Get('AnchorOpenCalendar-' + this.element.name).style.display = 'none';
                Common.AddClass(this.element, this.options.ClassCalendarLocked);
                Common.InsertHTMLString(this.element, Common.InsertType.After, '<span class="gtc-input-system"><i class="gtc-icon-styles fa fa-lock"></i></span>');
            }

        },

        _enableControl: function () {

            if (this.Locked) {
                Common.RemoveAttr(this.element, 'disabled');
                Common.RemoveAttr(this.element, 'data-disabled');
                Common.SetAttr(this.element, 'tabindex', this.FocusIndex);
                Common.Get('AnchorOpenCalendar-' + this.element.name).style.display = 'inline-table';
                Common.RemoveClass(this.element, this.options.ClassCalendarLocked);
                Common.Remove(Common.GetSibling(this.element, Common.SiblingType.Next));
                this.Locked = false;
            }

        },

        _init: function () {

        },

        _create: function () {

            // Create local properties
            this.Locked = false;

            // Create calendar
            if (!CalendarGlobals.CalendarCreated) {
                this._buildDatePicker();
                this._defineCalendarListenerIds();
                this._bindMouseEnterEvent();
                this._bindMouseLeaveEvent();
                CalendarGlobals.CalendarCreated = true;
            }

            this.FocusIndex = Common.GetAttr(this.element, 'tabindex');

            // Initialize fields
            this._insertOpenCalendarAnchor();
            this._bindCalendarOpenEvent();

            // Disabled?
            var dataDisabled = Common.GetAttr(this.element, 'data-disabled');
            if (dataDisabled == 'true') {
                this._disableControl();
            }

        }

    };

    WidgetFactory.Register('gtc.calendar', CalendarWidget);

} (window, document, Common, Cache, Events, Velocity));
